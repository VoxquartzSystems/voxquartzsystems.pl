import type { CategoryScore } from '../../lib/audit-data';

interface RadarChartProps {
  categories: CategoryScore[];
  size?: number;
}

export default function RadarChart({ categories, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 4;
  const angleStep = (2 * Math.PI) / categories.length;
  const startAngle = -Math.PI / 2;

  function polarToCartesian(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (radius / levels) * (level + 1);
    const points = categories
      .map((_, i) => polarToCartesian(startAngle + i * angleStep, r))
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
    return <polygon key={level} points={points} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
  });

  const axisLines = categories.map((_, i) => {
    const [x, y] = polarToCartesian(startAngle + i * angleStep, radius);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
  });

  const dataPoints = categories.map((cat, i) => {
    const r = (cat.percentage / 100) * radius;
    return polarToCartesian(startAngle + i * angleStep, r);
  });
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const labels = categories.map((cat, i) => {
    const labelRadius = radius + 24;
    const [x, y] = polarToCartesian(startAngle + i * angleStep, labelRadius);
    return (
      <text
        key={cat.key}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#8a8a96"
        fontSize="12"
        fontFamily="'Manrope', sans-serif"
        fontWeight="600"
      >
        {cat.label}
      </text>
    );
  });

  const dots = dataPoints.map(([x, y], i) => (
    <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
  ));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {gridPolygons}
      {axisLines}
      <polygon points={dataPolygon} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}
