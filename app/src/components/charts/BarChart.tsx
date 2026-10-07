import React, { useState } from "react";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  valueFormatter?: (val: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 180,
  valueFormatter = (v) => v.toString(),
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="text-center py-8 text-xs text-slate-400">No chart data available.</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 40; // reserve 40px for labels

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${data.length * 60} ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - ratio * chartHeight + 10;
          return (
            <line
              key={ratio}
              x1="0"
              y1={y}
              x2={data.length * 60}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const barWidth = 32;
          const x = idx * 60 + 14;
          const barH = (item.value / maxValue) * (chartHeight - 10);
          const y = chartHeight - barH + 10;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 3)}
                rx="4"
                fill={item.color || (isHovered ? "#0284c7" : "#0ea5e9")}
                className="transition-colors duration-150"
              />

              {/* Value on hover */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-800"
                >
                  {valueFormatter(item.value)}
                </text>
              )}

              {/* X-axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-500"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
