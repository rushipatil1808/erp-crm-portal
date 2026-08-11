import React from 'react';

export const LineChart: React.FC = () => {
  const points = [
    { label: 'Jan', val: 30 },
    { label: 'Fst', val: 42 },
    { label: 'Met', val: 45 },
    { label: 'Ap', val: 58 },
    { label: 'Rhy', val: 72 },
    { label: 'Jan', val: 82 },
    { label: 'Aul', val: 89 },
    { label: 'Aug', val: 95 },
    { label: 'One', val: 108 },
  ];

  const width = 450;
  const height = 140;
  const padding = 20;

  const minVal = 0;
  const maxVal = 120;

  const getX = (index: number) => padding + (index * (width - padding * 2)) / (points.length - 1);
  const getY = (val: number) => height - padding - ((val - minVal) * (height - padding * 2)) / (maxVal - minVal);

  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.val);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height="160" viewBox={`0 0 ${width} ${height + 20}`}>
        {/* Horizontal Grid lines */}
        {[30, 60, 90, 120].map((g) => (
          <line
            key={g}
            x1={padding}
            y1={getY(g)}
            x2={width - padding}
            y2={getY(g)}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        ))}

        {/* Smooth Trend Curve Line */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={getX(idx)} cy={getY(pt.val)} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
            <text x={getX(idx)} y={height + 12} fontSize="10" fill="#64748b" textAnchor="middle">
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
