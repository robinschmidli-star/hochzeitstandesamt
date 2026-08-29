import type { Dictionary } from "@/lib/i18n";

export function Disclaimer({ dictionary }: { dictionary: Dictionary }) {
  return (
    <aside className="rounded-xl border border-champagne/30 bg-white p-4 text-sm leading-6 text-soft-ink">
      {dictionary["common.disclaimer"]}
    </aside>
  );
}
