export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details key={item.question} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
          <summary className="cursor-pointer font-semibold text-ink">{item.question}</summary>
          <p className="mt-3 text-sm leading-6 text-soft-ink">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
