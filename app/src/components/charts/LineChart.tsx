import React, { useState } from "react";

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  unit?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  unit = "",
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length < 2) {
    return <div className="text-center py-8 text-xs text-slate-400">Need at least 2 points for a trend chart.</div>;
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.8;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  const totalWidth = (data.length - 1) * 60;
  const chartHeight = height - 50;

  // Compute coordinates
  const points = data.map((d, i) => {
    const x = i * 60 + 20;
    const y = chartHeight - ((d.value - minVal) / range) * (chartHeight - 20) + 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }, "");

  // Area fill path closing down to bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight + 10} L ${points[0].x} ${chartHeight + 10} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${totalWidth + 40} ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal reference lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = chartHeight - ratio * (chartHeight - 20) + 10;
          return (
            <line
              key={ratio}
              x1="10"
              y1={y}
              x2={totalWidth + 30}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line Path */}
        <path
          d={pathD}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={p.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 3.5}
                fill={isHovered ? "#0369a1" : "#ffffff"}
                stroke="#0284c7"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={p.x - 35}
                    y={p.y - 28}
                    width="70"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                  />
                  <text
                    x={p.x}
                    y={p.y - 15}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-white"
                  >
                    {p.value.toLocaleString()} {unit}
                  </text>
                </g>
              )}

              {/* X-axis Label */}
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-500"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
