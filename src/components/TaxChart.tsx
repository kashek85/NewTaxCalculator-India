import React from 'react';

interface TaxChartProps {
  taxOld: number;
  taxNew: number;
}

export const TaxChart: React.FC<TaxChartProps> = ({ taxOld, taxNew }) => {
  // Dimensions
  const width = 450;
  const height = 230;
  const paddingBottom = 40;
  const paddingTop = 40;
  const paddingLeft = 60;
  const paddingRight = 30;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  // Math for scales
  const maxVal = Math.max(taxOld, taxNew, 50000); // minimum scale upper bound of 50k

  // Y-Axis ticks
  const ticks = 4;
  const yTicks: number[] = [];
  for (let i = 0; i <= ticks; i++) {
    yTicks.push(Math.round((maxVal / ticks) * i));
  }

  // Bar parameters
  const barWidth = 65;
  const oldX = paddingLeft + (chartWidth / 4) - (barWidth / 2);
  const newX = paddingLeft + (3 * chartWidth / 4) - (barWidth / 2);

  // Calculate bar heights
  const oldBarHeight = (taxOld / maxVal) * chartHeight;
  const newBarHeight = (taxNew / maxVal) * chartHeight;

  const oldY = height - paddingBottom - oldBarHeight;
  const newY = height - paddingBottom - newBarHeight;

  // Helper to format tick labels
  const formatTick = (val: number): string => {
    if (val === 0) return '0';
    if (val >= 10000000) return (val / 10000000).toFixed(1).replace('.0', '') + ' Cr';
    if (val >= 100000) return (val / 100000).toFixed(1).replace('.0', '') + ' L';
    if (val >= 1000) return (val / 1000).toFixed(0) + ' k';
    return val.toString();
  };

  // Helper to format bar values
  const formatBarLabel = (val: number): string => {
    if (val === 0) return '₹0';
    if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  return (
    <div id="tax-chart-box">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="reactive-svg-chart" style={{ overflow: 'visible' }}>
        <defs>
          {/* Filters for glow effects */}
          <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Linear Gradients */}
          <linearGradient id="grad-old" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="grad-new" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Grid Lines & Y-axis Ticks */}
        {yTicks.map((tickVal, index) => {
          const yPos = height - paddingBottom - ((tickVal / maxVal) * chartHeight);
          return (
            <g key={index}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={yPos + 4}
                fill="var(--text-dark)"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
                fontFamily="var(--font-body)"
              >
                {formatTick(tickVal)}
              </text>
            </g>
          );
        })}

        {/* X-Axis Baseline */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Bar 1: Old Regime */}
        <g className="chart-bar-group">
          {/* Glowing background underlay */}
          {taxOld > 0 && (
            <rect
              x={oldX}
              y={oldY}
              width={barWidth}
              height={oldBarHeight}
              fill="rgba(59, 130, 246, 0.2)"
              rx="6"
              filter="url(#glow-indigo)"
            />
          )}
          {/* Solid bar */}
          <rect
            x={oldX}
            y={oldY}
            width={barWidth}
            height={oldBarHeight}
            fill="url(#grad-old)"
            rx="6"
            className="chart-rect-bar old-bar"
            style={{
              transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), y 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          {/* Tax Amount Label */}
          <text
            x={oldX + barWidth / 2}
            y={oldY - 10}
            fill="var(--text-main)"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            style={{ transition: 'y 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {formatBarLabel(taxOld)}
          </text>
          {/* Label below Axis */}
          <text
            x={oldX + barWidth / 2}
            y={height - 15}
            fill="var(--text-muted)"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
          >
            Old Regime
          </text>
        </g>

        {/* Bar 2: New Regime */}
        <g className="chart-bar-group">
          {/* Glowing background underlay */}
          {taxNew > 0 && (
            <rect
              x={newX}
              y={newY}
              width={barWidth}
              height={newBarHeight}
              fill="rgba(16, 185, 129, 0.15)"
              rx="6"
              filter="url(#glow-emerald)"
            />
          )}
          {/* Solid bar */}
          <rect
            x={newX}
            y={newY}
            width={barWidth}
            height={newBarHeight}
            fill="url(#grad-new)"
            rx="6"
            className="chart-rect-bar new-bar"
            style={{
              transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), y 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          {/* Tax Amount Label */}
          <text
            x={newX + barWidth / 2}
            y={newY - 10}
            fill="var(--text-main)"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            style={{ transition: 'y 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {formatBarLabel(taxNew)}
          </text>
          {/* Label below Axis */}
          <text
            x={newX + barWidth / 2}
            y={height - 15}
            fill="var(--text-muted)"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
          >
            New Regime
          </text>
        </g>
      </svg>
    </div>
  );
};
