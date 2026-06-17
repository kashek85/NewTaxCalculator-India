import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onDownload
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire premium confetti burst
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24']
        });
      } catch (e) {
        console.warn('Confetti effect failed to fire:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="success-modal">
      <div className="modal-card success-card glass-panel">
        <div className="success-icon-animation">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h3>Payment Successful!</h3>
        <p>Your custom Tax Planning Blueprint has been generated.</p>
        
        <div className="download-box">
          <div className="pdf-icon">
            <i className="fa-solid fa-file-pdf"></i>
          </div>
          <div className="pdf-info">
            <strong>Tax_Blueprint_2026_27.pdf</strong>
            <span>4.8 MB • PDF Report</span>
          </div>
          <button 
            type="button" 
            className="btn primary mini-btn" 
            id="fake-pdf-download-btn"
            onClick={onDownload}
          >
            <i className="fa-solid fa-download"></i> Download
          </button>
        </div>
        
        <button type="button" className="btn secondary" id="close-success-btn" onClick={onClose}>
          Back to Calculator
        </button>
      </div>
    </div>
  );
};
