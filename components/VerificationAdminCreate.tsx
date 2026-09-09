"use client";
import { useState } from "react";

export function VerificationAdminCreate({ offices }:{ offices:Array<{id:string;name:string}> }) {
  const [link,setLink]=useState(""); const [message,setMessage]=useState("");
  async function create(form:HTMLFormElement){ const response=await fetch("/admin/api/verification-requests",{method:"POST",body:new FormData(form)}); const result=await response.json(); if(response.ok){setLink(result.url);setMessage(`Gültig bis ${new Date(result.expiresAt).toLocaleDateString("de-CH")}`);}else setMessage(result.message); }
  return <form onSubmit={(event)=>{event.preventDefault();void create(event.currentTarget);}} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
    <h2 className="text-xl font-semibold">Verifikationslink erstellen</h2><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <select name="officeId" required className="rounded-lg border border-linen px-3 py-3"><option value="">Zivilstandsamt wählen</option>{offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
      <select name="language" className="rounded-lg border border-linen px-3 py-3"><option value="de">DE</option><option value="fr">FR</option><option value="it">IT</option></select>
      <button className="rounded-lg bg-sage px-5 py-3 font-semibold text-white">Link erstellen</button>
    </div>{link?<div className="mt-4 flex gap-2"><input readOnly value={link} className="min-w-0 flex-1 rounded-lg border border-linen px-3 py-2"/><button type="button" onClick={()=>void navigator.clipboard.writeText(link)} className="rounded-lg border border-sage px-4 font-semibold text-sage">Kopieren</button></div>:null}{message?<p className="mt-2 text-sm text-soft-ink">{message}</p>:null}
  </form>;
}
