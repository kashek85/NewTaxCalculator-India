import React from 'react';
import { formatINR } from '../utils/taxEngine';

interface TakeHomeCardProps {
  monthlyOldTakeHome: number;
  monthlyNewTakeHome: number;
}

export const TakeHomeCard: React.FC<TakeHomeCardProps> = ({
  monthlyOldTakeHome,
  monthlyNewTakeHome
}) => {
  return (
    <div className="take-home-grid">
      <div className="take-home-card old-theme">
        <span className="take-home-label">Old Regime Take-Home</span>
        <h4 className="take-home-val" id="take-home-old">
          {formatINR(monthlyOldTakeHome)} <span className="per-month">/mo</span>
        </h4>
        <p className="take-home-detail" id="take-home-detail-old">
          In-Hand Cash: {formatINR(monthlyOldTakeHome * 12)} / year
        </p>
      </div>

      <div className="take-home-card new-theme">
        <span className="take-home-label">New Regime Take-Home</span>
        <h4 className="take-home-val" id="take-home-new">
          {formatINR(monthlyNewTakeHome)} <span className="per-month">/mo</span>
        </h4>
        <p className="take-home-detail" id="take-home-detail-new">
          In-Hand Cash: {formatINR(monthlyNewTakeHome * 12)} / year
        </p>
      </div>
    </div>
  );
};
