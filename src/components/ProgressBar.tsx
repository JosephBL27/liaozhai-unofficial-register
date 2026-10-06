export type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
  inverse?: boolean;
};

export function ProgressIndicator({ value, max, label, inverse = false }: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const percentage = Math.round((Math.min(value, safeMax) / safeMax) * 100);

  return (
    <div className={inverse ? "progress-block is-inverse" : "progress-block"}>
      <div className="progress-copy">
        <span>{label}</span>
        <strong>{value} / {max}</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span style={{ inlineSize: `${percentage}%` }} />
      </div>
    </div>
  );
}

export const ProgressBar = ProgressIndicator;
