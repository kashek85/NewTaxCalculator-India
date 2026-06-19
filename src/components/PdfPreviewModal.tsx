import React, { useState } from 'react';
import type { TaxInputs, TaxComparisonResult } from '../types/tax';
import { formatINR } from '../utils/taxEngine';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  inputs: TaxInputs;
  result: TaxComparisonResult;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  inputs,
  result
}) => {
  const [activePage, setActivePage] = useState<number>(1);

  if (!isOpen) return null;

  const { grossSalary, age, ded80c, ded80d, ded24b, dedHra, dedNps, ded80tta, dedOther, familyPension } = inputs;
  const isNewOptimal = result.verdict === 'new' || result.verdict === 'identical';
  const optimalRegimeName = isNewOptimal ? 'New Tax Regime' : 'Old Tax Regime';
  const taxOld = result.oldRegime.finalTax;
  const taxNew = result.newRegime.finalTax;
  const optimalTax = isNewOptimal ? taxNew : taxOld;
  const alternateTax = isNewOptimal ? taxOld : taxNew;
  const alternateRegimeName = isNewOptimal ? 'Old Regime' : 'New Regime';
  
  const standardDed = isNewOptimal ? result.newRegime.stdDeduction : result.oldRegime.stdDeduction;
  const cess = isNewOptimal ? result.newRegime.cess : result.oldRegime.cess;
  const surcharge = isNewOptimal ? result.newRegime.surcharge : result.oldRegime.surcharge;

  const capped80d = Math.min(ded80d, age === 'general' ? 75000 : 100000);
  const capped80tta = Math.min(ded80tta, age === 'general' ? 10000 : 50000);
  
  const baseDeductions = ded80c + capped80d + ded24b + dedHra + dedNps + capped80tta + dedOther;
  const specializedReliefs = Math.max(0, result.oldRegime.otherDeductions - baseDeductions);

  // Crossover calculations for Page 2
  const crossoverGoal = result.crossoverDeductions;
  const allowedEmployerNps = result.oldRegime.allowedEmployerNps;
  const restDeductionsOld = result.oldRegime.otherDeductions;
  const percentCrossover = crossoverGoal === 0 
    ? 100 
    : Math.min(100, Math.round((restDeductionsOld / crossoverGoal) * 100));

  // Basic/Rent calculations for Page 2 HRA Audit
  const monthlyBasic = Math.round(grossSalary * 0.4 / 12); // Assume basic is 40% of gross
  const actualHRA = Math.round(monthlyBasic * 0.5); // Assume HRA is 50% of basic
  const annualHRA = actualHRA * 12;
  const annualBasic = monthlyBasic * 12;
  const annualRentPaid = dedHra > 0 ? dedHra + (0.10 * annualBasic) : actualHRA * 1.2 * 12; // Back-calculate rent or estimate
  const rentMinus10Percent = Math.max(0, annualRentPaid - (0.10 * annualBasic));
  const metroLimit = Math.round(annualBasic * 0.5);

  return (
    <div className="modal-backdrop" id="preview-modal">
      <div className="modal-card preview-modal-card glass-panel">
        <button className="modal-close" id="close-preview-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="preview-layout">
          {/* PDF Viewer Left Sidebar */}
          <div className="pdf-sidebar">
            <div className="sidebar-header">
              <h4>REPORT PAGES</h4>
            </div>
            <div className="pdf-thumbnails">
              {[
                { num: 1, name: 'Tax Summary' },
                { num: 2, name: 'Strategy' },
                { num: 3, name: 'Investments' },
                { num: 4, name: 'ITR Checklist' },
                { num: 5, name: 'CA Sheet' }
              ].map((page) => (
                <div
                  key={page.num}
                  className={`thumbnail ${activePage === page.num ? 'active' : ''}`}
                  onClick={() => setActivePage(page.num)}
                >
                  <div className="thumb-page-num">{page.num}</div>
                  <span>{page.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Page Area */}
          <div className="pdf-viewer-content">
            <div className="pdf-viewer-header">
              <div className="doc-title">
                <i className="fa-solid fa-file-pdf"></i> tax_blueprint_{inputs.grossSalary}.pdf
              </div>
              <button
                type="button"
                className="btn primary mini-btn"
                id="preview-pay-btn"
                onClick={onDownload}
              >
                <i className="fa-solid fa-download"></i> Download PDF
              </button>
            </div>

            <div className="pdf-page-scrollbox">
              {/* Page 1: Summary */}
              {activePage === 1 && (
                <div className="pdf-page-sheet" id="preview-page-1">
                  <div className="pdf-header">
                    <span className="doc-code">TAXOPTIMA PREMIUM REPORT</span>
                    <span className="doc-page">PAGE 1 OF 5</span>
                  </div>
                  <div className="pdf-body">
                    <div className="pdf-title-block">
                      <h2>PERSONAL TAX PLANNING BLUEPRINT</h2>
                      <span className="sub">Assessment Year 2026-27 | Prepared for Custom Profile</span>
                    </div>
                    <div className="pdf-text-block">
                      <p>
                        Based on your input parameters of Gross Salary {formatINR(grossSalary)}, this blueprint outlines the optimal tax regime and investment strategies to maximize your take-home cash flow.
                      </p>
                    </div>

                    <div className="pdf-callout success-callout">
                      <span className="callout-label">OPTIMAL REGIME CHOICE</span>
                      <h3>{optimalRegimeName} is highly recommended</h3>
                      <p>
                        By opting for the {optimalRegimeName}, you will pay{' '}
                        <strong>{formatINR(optimalTax)}</strong> in taxes. In comparison, the{' '}
                        {alternateRegimeName} would result in <strong>{formatINR(alternateTax)}</strong>.
                        {result.savings > 0 && (
                          <> This results in a net annual savings of <strong>{formatINR(result.savings)}</strong>.</>
                        )}
                      </p>
                    </div>

                    <h4>Comparison Summary</h4>
                    <table className="pdf-table">
                      <thead>
                        <tr>
                          <th>Key Metrics</th>
                          <th>Old Regime</th>
                          <th>New Regime</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Gross Income</td>
                          <td>{formatINR(result.oldRegime.totalGross)}</td>
                          <td>{formatINR(result.newRegime.totalGross)}</td>
                        </tr>
                        <tr>
                          <td>Standard Deduction</td>
                          <td>-{formatINR(result.oldRegime.stdDeduction)}</td>
                          <td>-{formatINR(result.newRegime.stdDeduction)}</td>
                        </tr>
                        <tr>
                          <td>Other Deductions</td>
                          <td>-{formatINR(result.oldRegime.otherDeductions)}</td>
                          <td>₹0</td>
                        </tr>
                        <tr className="highlight-row">
                          <td>Net Taxable Income</td>
                          <td>{formatINR(result.oldRegime.taxableIncome)}</td>
                          <td>{formatINR(result.newRegime.taxableIncome)}</td>
                        </tr>
                        {((result.oldRegime.stcgTax || 0) > 0 || (result.newRegime.stcgTax || 0) > 0) && (
                          <tr>
                            <td>STCG Tax (Sec 111A - 20%)</td>
                            <td>{formatINR(result.oldRegime.stcgTax || 0)}</td>
                            <td>{formatINR(result.newRegime.stcgTax || 0)}</td>
                          </tr>
                        )}
                        {((result.oldRegime.ltcgTax || 0) > 0 || (result.newRegime.ltcgTax || 0) > 0) && (
                          <tr>
                            <td>LTCG Tax (Sec 112A - 12.5%)</td>
                            <td>{formatINR(result.oldRegime.ltcgTax || 0)}</td>
                            <td>{formatINR(result.newRegime.ltcgTax || 0)}</td>
                          </tr>
                        )}
                        {((result.oldRegime.tcsCredit || 0) > 0 || (result.newRegime.tcsCredit || 0) > 0) && (
                          <tr>
                            <td>Vehicle TCS Credit (Sec 206C(1F))</td>
                            <td>-{formatINR(result.oldRegime.tcsCredit || 0)}</td>
                            <td>-{formatINR(result.newRegime.tcsCredit || 0)}</td>
                          </tr>
                        )}
                        <tr className="bold-row">
                          <td>Net Tax Payable</td>
                          <td>{formatINR(result.oldRegime.finalTax)}</td>
                          <td>{formatINR(result.newRegime.finalTax)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Page 2: Strategy */}
              {activePage === 2 && (
                <div className="pdf-page-sheet" id="preview-page-2">
                  <div className="pdf-header">
                    <span className="doc-code">TAXOPTIMA PREMIUM REPORT</span>
                    <span className="doc-page">PAGE 2 OF 5</span>
                  </div>
                  <div className="pdf-body">
                    <h3>Custom Optimization Strategy</h3>
                    <p>
                      To evaluate if the Old Regime can beat the New Regime, we computed your tax crossover threshold. For your Gross Salary of <strong>{formatINR(grossSalary)}</strong>, you require a minimum of <strong>{formatINR(crossoverGoal)}</strong> in eligible deductions under the Old Regime to break even.
                    </p>

                    <div className="pdf-progress-card">
                      <div className="bar-labels">
                        <span>Current: {formatINR(restDeductionsOld)}</span>
                        <span>Crossover Goal: {formatINR(crossoverGoal)}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${percentCrossover}%` }}></div>
                      </div>
                      <p className="progress-caption">
                        {crossoverGoal === 0 ? (
                          'Old Regime is already optimal at this level of declarations.'
                        ) : restDeductionsOld >= crossoverGoal ? (
                          'Your current deductions are optimal, making the Old Regime beneficial.'
                        ) : (
                          `You are currently ${formatINR(crossoverGoal - restDeductionsOld)} short of the breakeven threshold.`
                        )}
                      </p>
                    </div>

                    <h4>HRA Exemption Audit (Estimation)</h4>
                    <table className="pdf-table compact">
                      <thead>
                        <tr>
                          <th>HRA Calculation Criterion</th>
                          <th>Computed Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1. Actual HRA Allowance received (Estimated)</td>
                          <td>{formatINR(annualHRA)} /yr</td>
                        </tr>
                        <tr>
                          <td>2. Rent paid minus 10% of Basic salary</td>
                          <td>{formatINR(rentMinus10Percent)} /yr</td>
                        </tr>
                        <tr>
                          <td>3. 50% of Basic salary (Metro limit)</td>
                          <td>{formatINR(metroLimit)} /yr</td>
                        </tr>
                        <tr className="highlight-row">
                          <td>Eligible Tax-Exempt HRA (Minimum of above)</td>
                          <td>{formatINR(Math.min(annualHRA, rentMinus10Percent, metroLimit))} /yr</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="pdf-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <p>
                        <strong>HRA Tip:</strong> Submitting valid landlord receipts and rent agreements is crucial to avoid employer TDS overrides during January declaration rounds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: Investments */}
              {activePage === 3 && (
                <div className="pdf-page-sheet" id="preview-page-3">
                  <div className="pdf-header">
                    <span className="doc-code">TAXOPTIMA PREMIUM REPORT</span>
                    <span className="doc-page">PAGE 3 OF 5</span>
                  </div>
                  <div className="pdf-body">
                    <h3>Tax-Saving Investment Guide</h3>
                    <p>
                      If you prefer standard, safe investments to build long-term wealth while lowering tax under the Old Regime, allocate your ₹1.5 Lakh Section 80C and ₹50k Section 80CCD(1B) limits across these key Indian assets:
                    </p>

                    <table className="pdf-table">
                      <thead>
                        <tr>
                          <th>Investment Asset</th>
                          <th>Interest Rate</th>
                          <th>Lock-in Period</th>
                          <th>Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>ELSS Mutual Funds</strong></td>
                          <td>12% - 15% (Variable)</td>
                          <td>3 Years</td>
                          <td>Moderate to High</td>
                        </tr>
                        <tr>
                          <td><strong>Public Provident Fund (PPF)</strong></td>
                          <td>7.1% (Tax-Free)</td>
                          <td>15 Years</td>
                          <td>Zero Risk (Sovereign)</td>
                        </tr>
                        <tr>
                          <td><strong>National Pension Scheme (NPS)</strong></td>
                          <td>9% - 12% (Variable)</td>
                          <td>Till Age 60</td>
                          <td>Moderate</td>
                        </tr>
                        <tr>
                          <td><strong>Tax Saver FD</strong></td>
                          <td>6.5% - 7.5%</td>
                          <td>5 Years</td>
                          <td>Zero Risk</td>
                        </tr>
                      </tbody>
                    </table>

                    <h4>Optimal Capital Allocation (To hit ₹2,00,000 limit)</h4>
                    <div className="allocation-boxes">
                      <div className="alloc-box">
                        <span className="alloc-title">Section 80C (₹1.5 Lakh)</span>
                        <p>
                          Current declared: {formatINR(ded80c)}. Allocate in PPF for safe retirement and ELSS mutual funds for wealth creation.
                        </p>
                      </div>
                      <div className="alloc-box">
                        <span className="alloc-title">Section 80CCD(1B) (₹50k)</span>
                        <p>
                          Current declared: {formatINR(dedNps)}. Invest in Tier-1 NPS account to claim the exclusive pension plan deduction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 4: Checklist */}
              {activePage === 4 && (
                <div className="pdf-page-sheet" id="preview-page-4">
                  <div className="pdf-header">
                    <span className="doc-code">TAXOPTIMA PREMIUM REPORT</span>
                    <span className="doc-page">PAGE 4 OF 5</span>
                  </div>
                  <div className="pdf-body">
                    <h3>ITR Filing Checklist & Deadlines</h3>
                    <p>
                      Ensure you gather the correct paperwork to avoid interest charges under Section 234A or late filing penalties under Section 234F.
                    </p>

                    <div className="checklist-block">
                      <h4>Required Document Checklist</h4>
                      <ul className="pdf-checklist">
                        <li><i className="fa-regular fa-square"></i> <strong>Form 16 (Part A & B):</strong> Disbursed by your employer showing tax deducted (TDS).</li>
                        <li><i className="fa-regular fa-square"></i> <strong>Annual Information Statement (AIS/TIS):</strong> Verify with bank interest and stock gains.</li>
                        <li><i className="fa-regular fa-square"></i> <strong>Form 26AS:</strong> Tax credit statement showing all TDS transactions.</li>
                        <li><i className="fa-regular fa-square"></i> <strong>HRA Proofs:</strong> Rent agreement, rent receipts, and Landlord's PAN if annual rent exceeds ₹1L.</li>
                        <li><i className="fa-regular fa-square"></i> <strong>Home Loan Interest Certificate:</strong> Issued by your lender showing principal and interest parts.</li>
                      </ul>
                    </div>

                    <div className="timeline-block">
                      <h4>Important Dates (AY 2026-27)</h4>
                      <div className="timeline-item">
                        <div className="timeline-date">June 15, 2025</div>
                        <div className="timeline-text">1st Installment of Advance Tax (15%) due.</div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">June 30, 2025</div>
                        <div className="timeline-text">Deadline for employers to issue Form 16.</div>
                      </div>
                      <div className="timeline-item highlight">
                        <div className="timeline-date">July 31, 2026</div>
                        <div className="timeline-text"><strong>Final deadline for filing personal ITR.</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 5: CA Sheet */}
              {activePage === 5 && (
                <div className="pdf-page-sheet" id="preview-page-5">
                  <div className="pdf-header">
                    <span className="doc-code">TAXOPTIMA PREMIUM REPORT</span>
                    <span className="doc-page">PAGE 5 OF 5</span>
                  </div>
                  <div className="pdf-body">
                    <h3>CA-Ready Summary Sheet</h3>
                    <p>Print this sheet and hand it directly to your Chartered Accountant or tax professional to file your ITR quickly.</p>

                    <div className="ca-summary-grid">
                      <div className="ca-item"><span>Taxpayer Profile:</span> <strong>Custom Profile ({age})</strong></div>
                      <div className="ca-item"><span>Assessment Year:</span> <strong>2026-27 (FY 2025-26)</strong></div>
                      <div className="ca-item"><span>Optimal Choice:</span> <strong>{optimalRegimeName}</strong></div>
                      <div className="ca-item"><span>Gross Salary:</span> <strong>{formatINR(grossSalary)}</strong></div>
                      <div className="ca-item"><span>Standard Deduction:</span> <strong>{formatINR(standardDed)}</strong></div>
                      <div className="ca-item"><span>Employer NPS Sec 80CCD(2):</span> <strong>{formatINR(allowedEmployerNps)}</strong></div>
                      {specializedReliefs > 0 && !isNewOptimal && (
                        <div className="ca-item"><span>Specialized Reliefs (Sec 80U/80DD/80E etc.):</span> <strong>{formatINR(specializedReliefs)}</strong></div>
                      )}
                      {familyPension > 0 && (
                        <div className="ca-item"><span>Family Pension (Sec 57(iia) applied):</span> <strong>{formatINR(familyPension)}</strong></div>
                      )}
                      <div className="ca-item"><span>Surcharge:</span> <strong>{formatINR(surcharge)}</strong></div>
                      <div className="ca-item"><span>Education Cess (4%):</span> <strong>{formatINR(cess)}</strong></div>
                      <div className="ca-item"><span>Net Tax Calculated:</span> <strong>{formatINR(optimalTax)}</strong></div>
                    </div>

                    <div className="ca-signature-block">
                      <div className="signature-line">
                        <span>Taxpayer Signature</span>
                      </div>
                      <div className="signature-line">
                        <span>Filing Date</span>
                      </div>
                    </div>
                    <div className="pdf-disclaimer">
                      <strong>Disclaimer:</strong> This blueprint is an estimation report generated dynamically based on client input parameters. Actual tax liabilities may vary depending on official verification of investments.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
