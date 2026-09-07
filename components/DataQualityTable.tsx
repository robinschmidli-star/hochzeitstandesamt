"use client";

import { useState } from "react";

export type DataQualityRow = {
  id: string;
  venue: string;
  office: string;
  canton: string;
  score: number;
  missing: string[];
  verification: string;
  updatedAt: string;
};

type SortKey = "venue" | "office" | "canton" | "score" | "verification" | "updatedAt";

export function DataQualityTable({ rows }: { rows: DataQualityRow[] }) {
  const [sort, setSort] = useState<SortKey>("score");
  const sorted = [...rows].sort((a, b) => sort === "score" ? a.score - b.score : String(a[sort]).localeCompare(String(b[sort]), "de"));
  const heading = (label: string, key: SortKey) => <button type="button" className="font-semibold underline-offset-2 hover:underline" onClick={() => setSort(key)}>{label}</button>;
  return <div className="overflow-x-auto rounded-xl border border-linen bg-white shadow-soft">
    <table className="min-w-full text-left text-sm">
      <thead className="border-b border-linen bg-stone-50"><tr>
        <th className="p-3">{heading("Trauort", "venue")}</th><th className="p-3">{heading("Zivilstandsamt", "office")}</th>
        <th className="p-3">{heading("Kanton", "canton")}</th><th className="p-3">{heading("Score", "score")}</th>
        <th className="p-3">Fehlende Hauptfelder</th><th className="p-3">{heading("Verification", "verification")}</th>
        <th className="p-3">{heading("Letzte Aktualisierung", "updatedAt")}</th>
      </tr></thead>
      <tbody>{sorted.map((row) => <tr key={row.id} className="border-b border-linen align-top last:border-0">
        <td className="p-3 font-medium">{row.venue}</td><td className="p-3">{row.office}</td><td className="p-3">{row.canton}</td>
        <td className="p-3 font-semibold">{row.score}</td><td className="max-w-md p-3 text-soft-ink">{row.missing.join(", ") || "–"}</td>
        <td className="p-3">{row.verification}</td><td className="p-3">{row.updatedAt || "–"}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
