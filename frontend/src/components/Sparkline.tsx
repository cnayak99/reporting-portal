interface SparklineProps {
  values: number[];
  tone?: "teal" | "coral" | "gold";
}

export function Sparkline({ values, tone = "teal" }: SparklineProps) {
  const max = Math.max(...values);

  return (
    <div className={`sparkline sparkline-${tone}`} aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

