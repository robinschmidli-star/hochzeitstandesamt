"use client";

import { useState } from "react";
import type { VerificationRequestView } from "@/lib/verification";

const booleanFields = new Set(["official_ceremony_possible", "indoor", "outdoor", "wheelchair_accessible", "reservation_required"]);
const numberFields = new Set(["capacity_min", "capacity_max"]);
const jsonFields = new Set(["ceremony_days", "ceremony_times"]);

export function VerificationForm({ request, labels, token }: { request: VerificationRequestView; labels: Record<string,string>; token: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [delegated, setDelegated] = useState<Record<string,string>>({});
  const entities = request.venueId ? request.snapshot.venues : [request.snapshot.office, ...request.snapshot.venues];

  async function submit(form: HTMLFormElement, confirmAll = false) {
    setBusy(true); setMessage("");
    try {
      const data = new FormData(form);
      const changes: Record<string, unknown> = {};
      for (const [key, raw] of data.entries()) {
        if (!key.startsWith("field:")) continue;
        const field = key.split(":").at(-1)!;
        const value = String(raw).trim();
        changes[key.slice(6)] = booleanFields.has(field) ? (value === "" ? null : value === "true")
          : numberFields.has(field) ? (value === "" ? null : Number(value))
          : jsonFields.has(field) ? (value === "" ? null : JSON.parse(value)) : (value || null);
      }
      const response = await fetch(`/api/verify/${token}/submit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes, confirmAll }) });
      const result = await response.json();
      setMessage(response.ok ? labels[confirmAll ? "verify.done.confirmed" : "verify.done.submitted"] : (result.message ?? labels["verify.error"]));
    } catch { setMessage(labels["verify.invalidJson"] ?? labels["verify.error"]); }
    finally { setBusy(false); }
  }

  async function delegate(venueId: string) {
    setBusy(true);
    const response = await fetch(`/api/verify/${token}/delegate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ venueId }) });
    const result = await response.json(); setBusy(false);
    if (response.ok) setDelegated((current) => ({ ...current, [venueId]: result.url }));
    else setMessage(result.message ?? labels["verify.error"]);
  }

  return <form onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }} className="grid gap-7">
    {entities.map((entity) => <section key={entity.id} className="rounded-xl border border-linen bg-white p-5 shadow-soft sm:p-7">
      <h2 className="text-2xl font-semibold text-ink">{entity.name}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.entries(entity.fields).map(([field, value]) => <label key={field} className={jsonFields.has(field) ? "sm:col-span-2" : ""}>
          <span className="mb-1 block text-sm font-semibold text-ink">{labels[`verify.field.${field}`] ?? field}</span>
          {booleanFields.has(field) ? <select name={`field:${entity.entityType}:${entity.id}:${field}`} defaultValue={value == null ? "" : String(value)} className="focus-ring w-full rounded-lg border border-linen bg-white px-3 py-3">
            <option value="">{labels["verify.missing"]}</option><option value="true">{labels["common.yes"]}</option><option value="false">{labels["common.no"]}</option>
          </select> : <textarea rows={jsonFields.has(field) ? 3 : 1} name={`field:${entity.entityType}:${entity.id}:${field}`} defaultValue={jsonFields.has(field) && value != null ? JSON.stringify(value) : String(value ?? "")} placeholder={labels["verify.missing"]} className={`focus-ring w-full rounded-lg border px-3 py-3 ${value == null || value === "" ? "border-champagne bg-amber-50/40" : "border-linen bg-white"}`} />}
        </label>)}
      </div>
      {!request.venueId && entity.entityType === "wedding_venue" ? <div className="mt-5 border-t border-linen pt-4">
        <button type="button" disabled={busy} onClick={() => void delegate(entity.id)} className="text-sm font-semibold text-sage underline underline-offset-4">{labels["verify.delegate"]}</button>
        {delegated[entity.id] ? <div className="mt-3 flex gap-2"><input readOnly value={delegated[entity.id]} className="min-w-0 flex-1 rounded-lg border border-linen px-3 py-2 text-sm"/><button type="button" onClick={() => void navigator.clipboard.writeText(delegated[entity.id])} className="rounded-lg bg-sage px-3 py-2 text-sm font-semibold text-white">{labels["verify.copy"]}</button></div> : null}
      </div> : null}
    </section>)}
    {message ? <p role="status" className="rounded-lg border border-sage/20 bg-sage/5 p-4 text-ink">{message}</p> : null}
    <div className="flex flex-col gap-3 sm:flex-row">
      <button disabled={busy} className="rounded-lg bg-sage px-6 py-4 font-semibold text-white disabled:opacity-50">{labels["verify.submit"]}</button>
      <button type="button" disabled={busy} onClick={(event) => void submit(event.currentTarget.form!, true)} className="rounded-lg border border-sage px-6 py-4 font-semibold text-sage disabled:opacity-50">{labels["verify.confirmAll"]}</button>
    </div>
  </form>;
}
