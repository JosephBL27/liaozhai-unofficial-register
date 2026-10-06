import { Minus, Plus, RotateCcw } from "lucide-react";

type ZoomControlProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export function ZoomControl({
  value,
  min = 0.84,
  max = 1.18,
  step = 0.08,
  onChange,
}: ZoomControlProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Number(next.toFixed(2))));
  const percent = Math.round(value * 100);

  return (
    <div className="zoom-control" role="group" aria-label="Zoom radial register">
      <button type="button" disabled={value <= min} onClick={() => onChange(clamp(value - step))} aria-label="Zoom out">
        <Minus aria-hidden="true" />
      </button>
      <output aria-live="polite" aria-label={`Radial register zoom ${percent} percent`}>{percent}%</output>
      <button type="button" disabled={value >= max} onClick={() => onChange(clamp(value + step))} aria-label="Zoom in">
        <Plus aria-hidden="true" />
      </button>
      <button type="button" disabled={value === 1} onClick={() => onChange(1)} aria-label="Reset radial register zoom">
        <RotateCcw aria-hidden="true" />
      </button>
    </div>
  );
}
