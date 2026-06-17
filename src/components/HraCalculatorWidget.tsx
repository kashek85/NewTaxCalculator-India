import React, { useState } from 'react';

interface HraCalculatorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (exemption: number) => void;
}

export const HraCalculatorWidget: React.FC<HraCalculatorWidgetProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [basic, setBasic] = useState<number>(50000);
  const [hra, setHra] = useState<number>(25000);
  const [rent, setRent] = useState<number>(20000);
  const [isMetro, setIsMetro] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleApply = () => {
    const basicDA = basic * 12;
    const hraReceived = hra * 12;
    const rentPaid = rent * 12;

    if (basicDA <= 0 || hraReceived <= 0 || rentPaid <= 0) {
      alert('Please enter valid monthly amounts.');
      return;
    }

    // HRA Exemption Rules: Min of:
    // 1. Actual HRA received
    // 2. Rent paid minus 10% of basic salary
    // 3. 50% of basic salary (for metro) or 40% (for non-metro)
    const check1 = hraReceived;
    const check2 = Math.max(0, rentPaid - 0.10 * basicDA);
    const check3 = isMetro ? 0.50 * basicDA : 0.40 * basicDA;

    const exemption = Math.round(Math.min(check1, check2, check3));
    onApply(exemption);
  };

  return (
    <div className="modal-backdrop" id="hra-calculator-modal">
      <div className="modal-card glass-panel" style={{ maxWidth: '500px' }}>
        <button type="button" className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="modal-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <div className="modal-icon-glow" style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-glow)', border: '1px solid var(--border-color-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'var(--color-primary)', boxShadow: '0 0 15px var(--color-primary-glow)' }}>
            <i className="fa-solid fa-calculator"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>HRA Exemption Estimator</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculate eligible House Rent Allowance exemption</span>
          </div>
        </div>
      
        <div className="widget-body">
          <div className="nested-grid" style={{ marginBottom: '16px' }}>
            <div className="nested-field">
              <label>Monthly Basic + DA</label>
              <input
                type="number"
                value={basic}
                onChange={(e) => setBasic(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="nested-field">
              <label>Monthly HRA Received</label>
              <input
                type="number"
                value={hra}
                onChange={(e) => setHra(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="nested-grid" style={{ marginBottom: '20px' }}>
            <div className="nested-field">
              <label>Monthly Rent Paid</label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="nested-field">
              <label>Metro City? (50% cap)</label>
              <div className="segment-control minified" style={{ height: '31px' }}>
                <button
                  type="button"
                  className={`segment-btn ${isMetro ? 'active' : ''}`}
                  onClick={() => setIsMetro(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`segment-btn ${!isMetro ? 'active' : ''}`}
                  onClick={() => setIsMetro(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <button type="button" className="btn primary full-width" onClick={handleApply}>
            Calculate &amp; Apply Exemption
          </button>
        </div>
      </div>
    </div>
  );
};
