export type PasswordStrengthMeterProps = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

const SEGMENTS = [1, 2, 3, 4] as const;

const FILL = ['bg-error', 'bg-error', 'bg-warn', 'bg-success', 'bg-success'] as const;

export function PasswordStrengthMeter({ score, label }: PasswordStrengthMeterProps) {
  return (
    <div
      className="flex w-full flex-col gap-1"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={score}
      aria-valuetext={label}
    >
      <span className="flex gap-1">
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full ${
              score > 0 && segment <= score ? FILL[score] : 'bg-bdr-subtle'
            }`}
          />
        ))}
      </span>

      <span className="text-subtle h-4 text-sm">{score === 0 ? '' : label}</span>
    </div>
  );
}
