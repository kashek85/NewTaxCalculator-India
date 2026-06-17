import React from 'react';
import type { TaxBreakdown } from '../types/tax';
import { formatINR } from '../utils/taxEngine';

interface BreakdownTableProps {
  oldBreakdown: TaxBreakdown;
  newBreakdown: TaxBreakdown;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({
  oldBreakdown,
  newBreakdown
}) => {
  const showMarginalRelief = oldBreakdown.marginalRelief > 0 || newBreakdown.marginalRelief > 0;

  return (
    <div className="table-responsive">
      <table className="breakdown-table">
        <thead>
          <tr>
            <th>Tax Calculations</th>
            <th>Old Regime</th>
            <th>New Regime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gross Income <span className="cell-note">(incl. allowed employer NPS)</span></td>
            <td id="breakdown-gross-old">{formatINR(oldBreakdown.totalGross)}</td>
            <td id="breakdown-gross-new">{formatINR(newBreakdown.totalGross)}</td>
          </tr>
          <tr>
            <td>Standard Deduction</td>
            <td id="breakdown-std-old" className="minus-val">-{formatINR(oldBreakdown.stdDeduction)}</td>
            <td id="breakdown-std-new" className="minus-val">-{formatINR(newBreakdown.stdDeduction)}</td>
          </tr>
          <tr>
            <td>Employer NPS Deduction <span className="cell-note">(Sec 80CCD(2))</span></td>
            <td id="breakdown-empnps-old" className="minus-val">-{formatINR(oldBreakdown.allowedEmployerNps)}</td>
            <td id="breakdown-empnps-new" className="minus-val">-{formatINR(newBreakdown.allowedEmployerNps)}</td>
          </tr>
          <tr>
            <td>Other Deductions <span className="cell-note">(HRA, 80C, 80D, 24b, etc.)</span></td>
            <td id="breakdown-ded-old" className="minus-val">-{formatINR(oldBreakdown.otherDeductions)}</td>
            <td className="zero-val">₹0</td>
          </tr>
          <tr className="subtotal-row">
            <td>Net Taxable Income</td>
            <td id="breakdown-taxable-old" className="bold-val">{formatINR(oldBreakdown.taxableIncome)}</td>
            <td id="breakdown-taxable-new" className="bold-val">{formatINR(newBreakdown.taxableIncome)}</td>
          </tr>
          <tr>
            <td>Tax on Slab Rates</td>
            <td id="breakdown-slabtax-old">{formatINR(oldBreakdown.baseTax)}</td>
            <td id="breakdown-slabtax-new">{formatINR(newBreakdown.baseTax)}</td>
          </tr>
          <tr>
            <td>Tax Rebate <span className="cell-note">(Sec 87A)</span></td>
            <td id="breakdown-rebate-old" className="minus-val">-{formatINR(oldBreakdown.rebate)}</td>
            <td id="breakdown-rebate-new" className="minus-val">-{formatINR(newBreakdown.rebate)}</td>
          </tr>
          <tr>
            <td>Surcharge</td>
            <td id="breakdown-surcharge-old">{formatINR(oldBreakdown.surcharge)}</td>
            <td id="breakdown-surcharge-new">{formatINR(newBreakdown.surcharge)}</td>
          </tr>
          
          {showMarginalRelief && (
            <tr id="breakdown-mr-row">
              <td>Marginal Relief</td>
              <td id="breakdown-mr-old" className="minus-val">-{formatINR(oldBreakdown.marginalRelief)}</td>
              <td id="breakdown-mr-new" className="minus-val">-{formatINR(newBreakdown.marginalRelief)}</td>
            </tr>
          )}

          <tr>
            <td>Health &amp; Education Cess <span className="cell-note">(4%)</span></td>
            <td id="breakdown-cess-old">{formatINR(oldBreakdown.cess)}</td>
            <td id="breakdown-cess-new">{formatINR(newBreakdown.cess)}</td>
          </tr>
          {((oldBreakdown.tcsCredit || 0) > 0 || (newBreakdown.tcsCredit || 0) > 0) && (
            <tr>
              <td>Vehicle TCS Credit <span className="cell-note">(Sec 206C(1F) - 1%)</span></td>
              <td className="minus-val">-{formatINR(oldBreakdown.tcsCredit || 0)}</td>
              <td className="minus-val">-{formatINR(newBreakdown.tcsCredit || 0)}</td>
            </tr>
          )}
          <tr className="total-row">
            <td>Net Tax Payable</td>
            <td id="breakdown-final-old" className="bold-val">{formatINR(oldBreakdown.finalTax)}</td>
            <td id="breakdown-final-new" className="bold-val">{formatINR(newBreakdown.finalTax)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
