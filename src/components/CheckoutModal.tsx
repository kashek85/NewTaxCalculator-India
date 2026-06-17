import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/taxEngine';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grossSalary: number;
  optimalRegime: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  grossSalary,
  optimalRegime
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card'>('upi');
  const [timerVal, setTimerVal] = useState<string>('05:00');
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let duration = 300;
    const interval = setInterval(() => {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const minStr = minutes < 10 ? '0' + minutes : minutes.toString();
      const secStr = seconds < 10 ? '0' + seconds : seconds.toString();
      setTimerVal(`${minStr}:${secStr}`);

      if (--duration < 0) {
        clearInterval(interval);
        setTimerVal('Expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatedPay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="modal-backdrop" id="checkout-modal">
      <div className="modal-card glass-panel">
        <button className="modal-close" id="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="modal-header">
          <div className="modal-icon-glow">
            <i className="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <h3>Personalized Tax Blueprint</h3>
          <p>AY 2026-27 Custom Optimization Blueprint for your income profile</p>
        </div>

        <div className="modal-body">
          <div className="price-box">
            <span className="price-label">Secure Checkout</span>
            <span className="price-value">₹199 <span className="price-original">₹499</span></span>
          </div>
          
          <div className="profile-summary">
            <div className="summary-chip">
              <span className="chip-dot"></span> Income: <strong>{formatINR(grossSalary)}</strong>
            </div>
            <div className="summary-chip">
              <span className="chip-dot"></span> Optimal Regime: <strong>{optimalRegime}</strong>
            </div>
          </div>

          {/* Payment Tabs */}
          <div className="payment-tabs">
            <div 
              className={`payment-tab ${activeTab === 'upi' ? 'active' : ''}`} 
              onClick={() => setActiveTab('upi')}
            >
              <i className="fa-solid fa-qrcode"></i> UPI Payment
            </div>
            <div 
              className={`payment-tab ${activeTab === 'card' ? 'active' : ''}`} 
              onClick={() => setActiveTab('card')}
            >
              <i className="fa-solid fa-credit-card"></i> Card / Netbanking
            </div>
          </div>

          {/* Tab Content: UPI */}
          {activeTab === 'upi' && (
            <div className="payment-content" id="tab-upi">
              <div className="qr-container">
                <div className="qr-code">
                  <i className="fa-solid fa-qrcode fa-5x"></i>
                  <span className="qr-overlay-logo">UPI</span>
                </div>
                <div className="qr-timer">
                  QR Expires in <span className="timer-highlight" id="timer-val">{timerVal}</span>
                </div>
              </div>
              <p className="payment-instructions">
                Scan the QR code with any UPI app (GPay, PhonePe, Paytm) or use simulated verification below.
              </p>
              <button 
                type="button" 
                className="btn primary full-width" 
                id="sim-pay-upi"
                disabled={processing}
                onClick={handleSimulatedPay}
              >
                {processing ? 'Processing...' : 'Verify & Pay'}
              </button>
            </div>
          )}

          {/* Tab Content: Card */}
          {activeTab === 'card' && (
            <div className="payment-content" id="tab-card">
              <div className="card-form-sim">
                <div className="card-field full-width">
                  <label>Card Number</label>
                  <input type="text" placeholder="•••• •••• •••• ••••" disabled />
                </div>
                <div className="card-row">
                  <div className="card-field">
                    <label>Expiry</label>
                    <input type="text" placeholder="MM/YY" disabled />
                  </div>
                  <div className="card-field">
                    <label>CVV</label>
                    <input type="password" placeholder="•••" disabled />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn primary full-width" 
                  id="sim-pay-card"
                  disabled={processing}
                  onClick={handleSimulatedPay}
                >
                  {processing ? 'Processing Card...' : 'Pay ₹199'}
                </button>
              </div>
            </div>
          )}

          {/* Secure badge */}
          <div className="secure-badge">
            <i className="fa-solid fa-shield-halved"></i> Secured by UPI Autopay / Razorpay. 100% Money-back guarantee.
          </div>
        </div>
      </div>
    </div>
  );
};
