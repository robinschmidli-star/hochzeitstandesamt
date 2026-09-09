import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { valueHash } from "@/lib/verification";

type Proposal = { id:string; verification_request_id:string; entity_type:string; entity_id:string; field_name:string; old_value:unknown; proposed_value:unknown; source_type:string; source_name:string };

export async function POST(request: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const decision = String(form.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["approved","rejected"].includes(decision)) return NextResponse.json({ message:"Ungültige Eingabe." },{status:400});
  const rows = await prisma.$queryRaw<Proposal[]>(Prisma.sql`
    SELECT p.id::text,p.verification_request_id::text,p.entity_type,p.entity_id::text,p.field_name,p.old_value,p.proposed_value,p.source_type,r.source_name
    FROM verification_change_proposals p JOIN verification_requests r ON r.id=p.verification_request_id
    WHERE p.id=${id}::uuid AND p.status='pending' FOR UPDATE
  `);
  const proposal = rows[0];
  if (!proposal) return NextResponse.json({message:"Vorschlag nicht gefunden."},{status:404});
  await prisma.$transaction(async (tx) => {
    if (decision === "approved") {
      const value = JSON.stringify(proposal.proposed_value ?? null);
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO field_verifications (id,entity_type,entity_id,field_name,verified_value,value_hash,verified_at,verified_by_type,verified_by_name,verification_request_id,status,created_at,updated_at,created_by)
        VALUES(gen_random_uuid(),${proposal.entity_type},${proposal.entity_id}::uuid,${proposal.field_name},${value}::jsonb,${valueHash(proposal.proposed_value)},now(),${proposal.source_type},${proposal.source_name},${proposal.verification_request_id}::uuid,'active',now(),now(),'verification_admin')
        ON CONFLICT(entity_type,entity_id,field_name,verified_by_type) DO UPDATE SET verified_value=EXCLUDED.verified_value,value_hash=EXCLUDED.value_hash,verified_at=now(),verified_by_name=EXCLUDED.verified_by_name,verification_request_id=EXCLUDED.verification_request_id,status='active',invalidated_at=NULL,updated_at=now()
      `);
      await tx.$executeRaw(Prisma.sql`INSERT INTO verification_review_events(id,proposal_id,decision,reviewed_by,created_at) VALUES(gen_random_uuid(),${id}::uuid,'approved','admin',now())`);
    }
    if(decision === "rejected") await tx.$executeRaw(Prisma.sql`INSERT INTO verification_review_events(id,proposal_id,decision,reviewed_by,created_at) VALUES(gen_random_uuid(),${id}::uuid,'rejected','admin',now())`);
    await tx.$executeRaw(Prisma.sql`UPDATE verification_change_proposals SET status=${decision},reviewed_at=now(),reviewed_by='admin',updated_at=now(),updated_by='verification_admin' WHERE id=${id}::uuid`);
  });
  return NextResponse.redirect(new URL("/admin/verifications", request.url),303);
}
