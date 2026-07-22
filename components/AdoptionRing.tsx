export function AdoptionRing({ adopted, goal }: { adopted: number; goal: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, adopted / goal);
  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36" role="img" aria-label={`${adopted} of ${goal} new categories adopted`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e6e6e6" strokeWidth="14" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset .6s ease" }}
      />
      <text x="70" y="68" textAnchor="middle" className="fill-ink text-2xl font-bold">
        {adopted}/{goal}
      </text>
      <text x="70" y="88" textAnchor="middle" className="fill-black/45 text-[10px]">
        categories
      </text>
    </svg>
  );
}
