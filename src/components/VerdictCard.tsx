import React from 'react';
import { formatINR } from '../utils/taxEngine';

interface VerdictCardProps {
  verdict: 'old' | 'new' | 'identical';
  savings: number;
  finalTaxNew: number;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  savings,
  finalTaxNew
}) => {
  const getCardThemeClass = () => {
    if (verdict === 'new') return 'new-regime-optimal';
    if (verdict === 'old') return 'old-regime-optimal';
    return '';
  };

  const renderContent = () => {
    if (verdict === 'identical') {
      return {
        icon: <i className="fa-solid fa-scale-balanced"></i>,
        title: 'Both Regimes are Identical',
        text: `Both options result in the exact same tax liability of ${formatINR(finalTaxNew)}.`
      };
    } else if (verdict === 'new') {
      return {
        icon: <i className="fa-solid fa-sparkles"></i>,
        title: 'Choose New Tax Regime',
        text: `Save ${formatINR(savings)} per year by filing under the default New Tax Regime.`
      };
    } else {
      return {
        icon: <i className="fa-solid fa-circle-check"></i>,
        title: 'Choose Old Tax Regime',
        text: `Save ${formatINR(savings)} per year by claiming deductions under the Old Tax Regime.`
      };
    }
  };

  const content = renderContent();

  return (
    <div className={`verdict-card ${getCardThemeClass()}`} id="verdict-card">
      <div className="verdict-icon" id="verdict-icon-container">
        {content.icon}
      </div>
      <div className="verdict-details">
        <span className="verdict-tagline">Optimal Tax Choice</span>
        <h3 className="verdict-main" id="verdict-text">{content.title}</h3>
        <p className="verdict-sub" id="verdict-savings">{content.text}</p>
      </div>
    </div>
  );
};
