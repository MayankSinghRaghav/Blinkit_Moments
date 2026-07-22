"use client";

export function ComfortDial({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const label = value < 25 ? "Subtle" : value > 70 ? "Adventurous" : "Balanced";
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor="comfort" className="text-sm font-medium">
          Comfort dial
        </label>
        <span className="text-xs font-medium text-brand">{label}</span>
      </div>
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
      <div className="flex justify-between text-[11px] text-black/45">
        <span>Only close to what I buy</span>
        <span>Surprise me</span>
      </div>
    </div>
  );
}
