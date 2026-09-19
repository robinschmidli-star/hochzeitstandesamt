"use client";
import { useState } from "react";

export function VerificationBatch() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  async function submit() {
    try {
      const parsed = JSON.parse(input);
      setStatus("Erzeuge Links …");
      const response = await fetch("/admin/api/verification-requests/batch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed) });
      const result = await response.json();
      if (!response.ok && response.status !== 207) { setStatus(result.message ?? "Batch fehlgeschlagen."); return; }
      setOutput((result.results ?? []).filter((item: { url?: string }) => item.url).map((item: { url: string }) => item.url).join("\n"));
      setStatus(`${result.created} Links erstellt, ${result.failed} Fehler.`);
    } catch { setStatus("Ungültiges JSON. Erwartet wird { items: [{ officeId, language }], replaceExisting, days }."); }
  }
  return <section className="rounded-xl border border-linen bg-white p-5 shadow-soft"><h2 className="text-xl font-semibold">Batch-Verifikation</h2><p className="mt-2 text-sm text-soft-ink">Bis zu 1’000 Ämter auf einmal. Beispiel: {`{"items":[{"officeId":"UUID","language":"de"}],"replaceExisting":true,"days":15}`}</p><textarea value={input} onChange={event=>setInput(event.target.value)} rows={7} className="mt-3 w-full rounded-lg border border-linen px-3 py-2 font-mono text-xs" placeholder="JSON-Batch hier einfügen"/><button type="button" onClick={()=>void submit()} className="mt-3 rounded-lg bg-sage px-5 py-3 font-semibold text-white">Batch ausführen</button>{status?<p className="mt-2 text-sm text-soft-ink">{status}</p>:null}{output?<textarea readOnly value={output} rows={12} className="mt-3 w-full rounded-lg border border-linen px-3 py-2 font-mono text-xs"/>:null}</section>;
}
