import type { TrustParameter } from "@/lib/types";

const R = 90;
const C = 110;

const point = (i: number, n: number, radius: number) => {
  const angle = (2 * Math.PI * i) / n;
  return `${(C + radius * Math.sin(angle)).toFixed(2)},${(
    C -
    radius * Math.cos(angle)
  ).toFixed(2)}`;
};

export default function TrustRadar({ data }: { data: TrustParameter[] }) {
  const n = data.length;
  if (!n) return null;

  return (
    <svg viewBox="0 0 220 220" width="210" role="img" aria-label="Trust score breakdown">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon
          key={k}
          points={data.map((_, i) => point(i, n, R * k)).join(" ")}
          fill="none"
          stroke="var(--line)"
        />
      ))}
      {data.map((_, i) => (
        <line
          key={i}
          x1={C}
          y1={C}
          x2={point(i, n, R).split(",")[0]}
          y2={point(i, n, R).split(",")[1]}
          stroke="var(--line)"
        />
      ))}
      <polygon
        points={data.map((d, i) => point(i, n, (R * d.score) / 100)).join(" ")}
        fill="rgba(46,158,79,.35)"
        stroke="var(--green2)"
        strokeWidth={2}
      />
    </svg>
  );
}
