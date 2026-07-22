"use client";

export function ComfortDial({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const label = value < 25 ? "Subtle" : value > 70 ? "Adventurous" : "Balanced";
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor="comfort" className="text-sm font-bold">
          Comfort dial
        </label>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">
          {label}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-black/45">
        How far from your usual basket the agent is allowed to reach.
      </p>
      <input
        id="comfort"
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-brand"
      />
      <div className="flex justify-between text-[10px] text-black/40">
        <span>Close to what I buy</span>
        <span>Surprise me</span>
      </div>
    </div>
  );
}
