import React from 'react';
import type { TaxInputs, TaxComparisonResult, RecommendationTip } from '../types/tax';
import { formatINR } from '../utils/taxEngine';

interface OptimizerInsightsProps {
  inputs: TaxInputs;
  result: TaxComparisonResult;
}

export const OptimizerInsights: React.FC<OptimizerInsightsProps> = ({
  inputs,
  result
}) => {
  const { grossSalary, ded80c, ded80d, dedNps, ded80tta, age } = inputs;
  const taxNew = result.newRegime.finalTax;
  const taxOld = result.oldRegime.finalTax;

  const getTips = (): RecommendationTip[] => {
    const tipsList: RecommendationTip[] = [];

    if (taxNew === 0 && grossSalary > 0) {
      tipsList.push({
        icon: 'fa-solid fa-circle-check',
        title: 'Zero Tax Liability',
        text: 'Your taxable income falls below the ₹12 Lakh slab under the New Regime, resulting in ₹0 tax due to Section 87A rebate.'
      });
    }

    // Section 80C
    if (taxOld > taxNew && ded80c < 150000) {
      const missing = 150000 - ded80c;
      tipsList.push({
        icon: 'fa-solid fa-piggy-bank',
        title: 'Maximize Section 80C',
        text: `Invest an additional ${formatINR(missing)} in ELSS, PPF, or EPF to hit the ₹1.5L cap and lower your Old Regime tax.`
      });
    }

    // Section 80CCD(1B) NPS
    if (taxOld > taxNew && dedNps < 50000) {
      const missingNps = 50000 - dedNps;
      tipsList.push({
        icon: 'fa-solid fa-wallet',
        title: 'Contribute to Self NPS',
        text: `Declare up to ${formatINR(missingNps)} in voluntary NPS contributions under Sec 80CCD(1B) for exclusive Old Regime deduction benefits.`
      });
    }

    // Section 80D
    const max80d = age === 'general' ? 75000 : 100000;
    if (taxOld > taxNew && ded80d < max80d) {
      const missingD = max80d - ded80d;
      tipsList.push({
        icon: 'fa-solid fa-heart-pulse',
        title: 'Claim Health Insurance Premium',
        text: `If you pay medical premiums for yourself or senior parents, claim up to ${formatINR(missingD)} under Section 80D.`
      });
    }

    // 80TTA / 80TTB
    const maxTta = age === 'general' ? 10000 : 50000;
    const codeTta = age === 'general' ? '80TTA' : '80TTB';
    if (taxOld > taxNew && ded80tta < maxTta) {
      const missingTta = maxTta - ded80tta;
      tipsList.push({
        icon: 'fa-solid fa-university',
        title: `Claim Interest u/s ${codeTta}`,
        text: `You can deduct up to ${formatINR(missingTta)} on interest earned from savings accounts (and FDs for seniors).`
      });
    }

    // General Old regime advice
    if (taxOld < taxNew) {
      tipsList.push({
        icon: 'fa-solid fa-circle-nodes',
        title: 'Old Regime is optimal',
        text: 'Your current deductions are high enough to save tax. Ensure all declarations are supported by investment receipts.'
      });
    }

    return tipsList;
  };

  const activeTips = getTips().slice(0, 3);
  const isFullyOptimized = taxNew === 0 && grossSalary > 0;

  const getBadgeStyle = () => {
    if (isFullyOptimized || activeTips.length === 0) {
      return {
        color: '#34d399',
        background: 'rgba(16, 185, 129, 0.1)'
      };
    } else {
      return {
        color: '#fbbf24',
        background: 'rgba(245, 158, 11, 0.1)'
      };
    }
  };

  return (
    <div className="panel-card insights-card">
      <div className="insights-header">
        <h4><i className="fa-solid fa-wand-magic-sparkles"></i> Advisor Recommendations</h4>
        <span 
          className="badge" 
          id="opt-badge"
          style={getBadgeStyle()}
        >
          {isFullyOptimized || activeTips.length === 0 ? 'Fully Optimized' : 'Tips Available'}
        </span>
      </div>

      <div className="insights-content" id="opt-insights-content">
        {activeTips.length === 0 ? (
          <p className="panel-subtitle" style={{ textAlign: 'center', padding: '20px 0' }}>
            No recommendations needed. Your tax profile is optimized!
          </p>
        ) : (
          activeTips.map((tip, idx) => (
            <div key={idx} className="opt-tip">
              <span className="opt-tip-icon">
                <i className={tip.icon}></i>
              </span>
              <div className="opt-tip-text">
                <strong>{tip.title}</strong>
                <span>{tip.text}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
