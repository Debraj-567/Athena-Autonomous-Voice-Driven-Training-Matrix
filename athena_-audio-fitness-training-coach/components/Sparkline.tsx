import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 20,
  strokeColor = 'currentColor',
  strokeWidth = 1.5,
}) => {
  if (data.length < 2) {
    return null; // Not enough data to draw a line
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const points = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point - min) / (range || 1)) * height; // handle range=0
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
