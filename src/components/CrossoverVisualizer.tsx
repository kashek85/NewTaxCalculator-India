import React from 'react';
import { formatINR } from '../utils/taxEngine';

interface CrossoverVisualizerProps {
  currentDeductions: number;
  requiredDeductions: number;
  grossSalary: number;
}

export const CrossoverVisualizer: React.FC<CrossoverVisualizerProps> = ({
  currentDeductions,
  requiredDeductions,
  grossSalary
}) => {
  const isOldOptimal = requiredDeductions === 0 || currentDeductions >= requiredDeductions;
  const percent = requiredDeductions === 0 
    ? 100 
    : Math.min(100, Math.round((currentDeductions / requiredDeductions) * 100));

  const renderDescription = () => {
    if (requiredDeductions === 0) {
      return (
        <>
          <strong>Old Regime is already optimal!</strong> Even with ₹0 deductions, the Old Regime is cheaper or equal to the New Regime at this income level.
        </>
      );
    } else if (currentDeductions >= requiredDeductions) {
      return (
        <>
          <strong>Old Regime is optimal!</strong> Your total deductions ({formatINR(currentDeductions)}) are greater than the crossover threshold of <strong>{formatINR(requiredDeductions)}</strong>.
        </>
      );
    } else {
      const gap = requiredDeductions - currentDeductions;
      if (requiredDeductions > grossSalary * 0.5) {
        return (
          <>
            To make Old Regime beneficial, you need <strong>{formatINR(requiredDeductions)}</strong> in deductions. This is <strong>impractical</strong> ({percent}% met), making the New Regime your default choice.
          </>
        );
      } else {
        return (
          <>
            Declare <strong>{formatINR(gap)}</strong> more in eligible deductions (like HRA, 80C, or Home Loan) to make the Old Regime cheaper than the New Regime.
          </>
        );
      }
    }
  };

  return (
    <div className="crossover-card glass-panel" id="crossover-card">
      <div className="crossover-header">
        <h3><i className="fa-solid fa-code-branch"></i> Crossover Threshold</h3>
        <span className="crossover-status" id="crossover-status-badge">
          {isOldOptimal ? 'Old Regime Better' : 'New Regime Better'}
        </span>
      </div>
      <div className="crossover-body">
        <p className="crossover-description" id="crossover-description">
          {renderDescription()}
        </p>
        <div className="crossover-progress-wrapper">
          <div 
            className="crossover-progress-bar" 
            id="crossover-progress-fill" 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <div className="crossover-labels">
          <span id="crossover-label-current">Current: {formatINR(currentDeductions)}</span>
          <span id="crossover-label-target">Required: {formatINR(requiredDeductions)}</span>
        </div>
      </div>
    </div>
  );
};
