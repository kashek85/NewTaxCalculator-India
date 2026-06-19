import { useState } from 'react';
import type { AgeProfile, TaxInputs, DisabilityLevel } from './types/tax';
import { calculateTaxAll } from './utils/taxEngine';
import { SliderInput } from './components/SliderInput';
import { HraCalculatorWidget } from './components/HraCalculatorWidget';
import { VerdictCard } from './components/VerdictCard';
import { TaxChart } from './components/TaxChart';
import { TakeHomeCard } from './components/TakeHomeCard';
import { CrossoverVisualizer } from './components/CrossoverVisualizer';
import { BreakdownTable } from './components/BreakdownTable';
import { OptimizerInsights } from './components/OptimizerInsights';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { PrintReport } from './components/PrintReport';

function App() {
  // Calculator inputs state
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [employerNps, setEmployerNps] = useState<number>(0);
  const [ded80c, setDed80c] = useState<number>(0);
  const [ded80d, setDed80d] = useState<number>(0);
  const [ded24b, setDed24b] = useState<number>(0);
  const [dedHra, setDedHra] = useState<number>(0);
  const [dedNps, setDedNps] = useState<number>(0);
  const [ded80tta, setDed80tta] = useState<number>(0);
  const [dedOther, setDedOther] = useState<number>(0);
  const [age, setAge] = useState<AgeProfile>('general');

  // Advanced specialized inputs state
  const [isDiffAbled, setIsDiffAbled] = useState<boolean>(false);
  const [disabilityLevel, setDisabilityLevel] = useState<DisabilityLevel>('none');
  const [hasDisabledDependent, setHasDisabledDependent] = useState<boolean>(false);
  const [dependentDisabilityLevel, setDependentDisabilityLevel] = useState<DisabilityLevel>('none');
  const [isDefenseExempt, setIsDefenseExempt] = useState<boolean>(false);
  const [familyPension, setFamilyPension] = useState<number>(0);
  const [sec80ggRent, setSec80ggRent] = useState<number>(0);
  const [sec80eInterest, setSec80eInterest] = useState<number>(0);
  const [sec80eeaInterest, setSec80eeaInterest] = useState<number>(0);
  const [donations100, setDonations100] = useState<number>(0);
  const [donations50, setDonations50] = useState<number>(0);
  const [sec80eeb, setSec80eeb] = useState<number>(0);
  const [vehiclePrice, setVehiclePrice] = useState<number>(0);
  
  // New Capital Gains & Loss Harvesting inputs state
  const [stcgEquities, setStcgEquities] = useState<number>(0);
  const [ltcgEquities, setLtcgEquities] = useState<number>(0);
  const [unrealizedLosses, setUnrealizedLosses] = useState<number>(0);

  // Document Ingestion Parsing Simulator state
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseMessage, setParseMessage] = useState<string>('');

  // UI state
  const [isHraWidgetOpen, setIsHraWidgetOpen] = useState<boolean>(false);
  const [isSpecialPanelOpen, setIsSpecialPanelOpen] = useState<boolean>(false);
  const [isCapitalGainsOpen, setIsCapitalGainsOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const handleAgeChange = (profile: AgeProfile) => {
    setAge(profile);
    if (profile === 'general') {
      if (ded80d > 75000) setDed80d(75000);
      if (ded80tta > 10000) setDed80tta(10000);
    } else {
      if (ded80d > 100000) setDed80d(100000);
      if (ded80tta > 50000) setDed80tta(50000);
    }
  };

  // Compile inputs and run calculations
  const inputs: TaxInputs = {
    grossSalary,
    employerNps,
    ded80c,
    ded80d,
    ded24b,
    dedHra,
    dedNps,
    ded80tta,
    dedOther,
    age,

    isDiffAbled,
    disabilityLevel,
    hasDisabledDependent,
    dependentDisabilityLevel,
    isDefenseExempt,
    familyPension,
    sec80ggRent,
    sec80eInterest,
    sec80eeaInterest,
    donations100,
    donations50,
    sec80eeb,
    vehiclePrice,
    stcgEquities,
    ltcgEquities,
    unrealizedLosses
  };

  const result = calculateTaxAll(inputs);

  // Dynamic caps config based on age profile
  const max80d = age === 'general' ? 75000 : 100000;
  const label80d = 'Section 80D (Health Insurance)';
  const tooltip80d = age === 'general' 
    ? 'Self/Family (₹25k) + Senior Parents (₹50k). Max ₹75,000.'
    : 'Self/Family (₹50k) + Parents (₹50k). Max ₹1,00,000.';
  const labels80d = age === 'general' ? ['₹0', '37.5k', '75k (Max)'] : ['₹0', '50k', '100k (Max)'];

  const max80tta = age === 'general' ? 10000 : 50000;
  const label80tta = age === 'general' ? 'Section 80TTA (Savings Interest)' : 'Section 80TTB (Seniors Savings & FD)';
  const tooltip80tta = age === 'general'
    ? 'Deduction on savings interest. Max ₹10,000.'
    : 'FD and savings interest deduction for seniors. Max ₹50,000.';
  const labels80tta = age === 'general' ? ['₹0', '5k', '10k (Max)'] : ['₹0', '25k', '50k (Max)'];

  const handleDownload = () => {
    setIsPreviewOpen(false);
    const element = document.querySelector('.print-report-container') as HTMLElement;
    if (!element) return;
    
    // Temporarily force display block with important priority so html2pdf can capture it
    element.style.setProperty('display', 'block', 'important');

    const opt = {
      margin:       0,
      filename:     `TaxOptima_Blueprint_${grossSalary}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak:    { mode: 'specify' as const, after: '.print-sheet' }
    };

    // @ts-ignore
    import('html2pdf.js').then((html2pdfModule) => {
      const exporter = html2pdfModule.default || html2pdfModule;
      exporter().set(opt).from(element).save().then(() => {
        // Hide the print container again
        element.style.setProperty('display', 'none', 'important');
        // Fire celebration confetti upon successful download
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default || confettiModule;
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24']
          });
        }).catch(err => console.warn('Confetti effect failed to fire:', err));
      });
    }).catch(err => {
      console.error('Failed to export PDF:', err);
      // Fallback to native print if library fails
      window.print();
    });
  };

  const handleReset = () => {
    setGrossSalary(0);
    setEmployerNps(0);
    setDed80c(0);
    setDed80d(0);
    setDed24b(0);
    setDedHra(0);
    setDedNps(0);
    setDed80tta(0);
    setDedOther(0);
    setAge('general');
    setIsDiffAbled(false);
    setDisabilityLevel('none');
    setHasDisabledDependent(false);
    setDependentDisabilityLevel('none');
    setIsDefenseExempt(false);
    setFamilyPension(0);
    setSec80ggRent(0);
    setSec80eInterest(0);
    setSec80eeaInterest(0);
    setDonations100(0);
    setDonations50(0);
    setSec80eeb(0);
    setVehiclePrice(0);
    setStcgEquities(0);
    setLtcgEquities(0);
    setUnrealizedLosses(0);
    setIsHraWidgetOpen(false);
    setIsSpecialPanelOpen(false);
    setIsCapitalGainsOpen(false);
    setIsPreviewOpen(false);
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsParsing(true);
    setParseMessage(`Analyzing ${file.name}...`);
    
    setTimeout(() => {
      setParseMessage("Extracting income ledgers & tax profiles...");
      setTimeout(() => {
        setGrossSalary(1850000);
        setEmployerNps(185000);
        setDed80c(150000);
        setDed80d(25000);
        setStcgEquities(150000);
        setLtcgEquities(350000);
        setUnrealizedLosses(180000);
        setAge('general');
        setIsParsing(false);
        setParseMessage("Successfully parsed Form 16 & brokerage statements!");
        
        // Trigger confetti celebration!
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default || confettiModule;
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }).catch(err => console.warn('Confetti effect failed to fire:', err));
        
        // Reset file input value so same file can be uploaded again
        e.target.value = '';

        setTimeout(() => setParseMessage(''), 4000);
      }, 1000);
    }, 1000);
  };

  return (
    <>
      <div className="app-container">
        {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon"><i className="fa-solid fa-indian-rupee-sign"></i></span>
          <div className="logo-text">
            <h1>TaxOptima Harvest</h1>
            <span className="logo-tag">AI-First Portfolio Tax Optimizer & Planner</span>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-label">Financial Year</span>
          <span className="badge-value">2025-26 (AY 2026-27)</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="app-content">
        
        {/* Pre-Season Banner */}
        <div className="preseason-banner glass-panel" style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '12px 20px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          color: '#e2e8f0',
          marginBottom: '15px',
          fontSize: '14px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
            <i className="fa-solid fa-bullseye"></i>
          </span>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <strong>Pre-Season Optimization Window:</strong> The Financial Year 2025-26 closes on <strong>March 31, 2026</strong>. Drag & drop files below to auto-fill, optimize regimes, and harvest tax-loss savings before the deadline.
          </div>
          <div className="banner-tag" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pre-Season MVP
          </div>
        </div>

        {/* Left Panel: Inputs */}
        <section className="input-panel glass-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2><i className="fa-solid fa-sliders"></i> Income & Deductions</h2>
              <p className="panel-tagline">Adjust sliders to customize your tax profile</p>
            </div>
            <button 
              type="button" 
              onClick={handleReset} 
              className="text-action-btn"
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <i className="fa-solid fa-rotate-left"></i> Reset All
            </button>
          </div>

          {/* Drag & Drop Ingestion Simulator */}
          <div className="upload-zone-wrapper" style={{ marginBottom: '20px' }}>
            <div className="upload-zone" style={{
              border: '2px dashed rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.3)',
              transition: 'var(--transition-smooth)',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
            }}>
              {isParsing ? (
                <div style={{ padding: '10px 0' }}>
                  <div className="spinner" style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid rgba(59, 130, 246, 0.2)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto 10px auto',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                  <p style={{ color: '#60a5fa', fontSize: '13.5px', fontWeight: 500, margin: 0 }}>{parseMessage}</p>
                </div>
              ) : parseMessage ? (
                <div style={{ padding: '10px 0' }}>
                  <span style={{ fontSize: '24px', color: '#10b981', display: 'block', marginBottom: '8px' }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </span>
                  <p style={{ color: '#34d399', fontSize: '13.5px', fontWeight: 500, margin: 0 }}>{parseMessage}</p>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '24px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </span>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 4px 0', fontSize: '14.5px' }}>Upload Tax Documents to Auto-Fill</h4>
                  <p style={{ color: '#94a3b8', margin: '0 0 12px 0', fontSize: '12px' }}>
                    Drag & drop Form 16, CAMS PDF, or Broker statements
                  </p>
                  <label className="upload-btn" style={{
                    display: 'inline-block',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}>
                    Choose File
                    <input 
                      type="file" 
                      accept=".pdf,.xlsx,.csv,.xls" 
                      onChange={handleFileUploadSimulate} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Taxpayer Profile Section */}
          <div className="form-section">
            <h3 className="section-title"><i className="fa-regular fa-user"></i> Taxpayer Profile</h3>
            <div className="input-field-wrapper">
              <div className="input-label-row">
                <label>Age Bracket</label>
              </div>
              <div className="segment-control" id="age-selector">
                <button
                  type="button"
                  className={`segment-btn ${age === 'general' ? 'active' : ''}`}
                  onClick={() => handleAgeChange('general')}
                >
                  General (&lt; 60)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${age === 'senior' ? 'active' : ''}`}
                  onClick={() => handleAgeChange('senior')}
                >
                  Senior (60 - 80)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${age === 'super-senior' ? 'active' : ''}`}
                  onClick={() => handleAgeChange('super-senior')}
                >
                  Super Senior (80+)
                </button>
              </div>
            </div>
          </div>

          {/* Income Section */}
          <div className="form-section">
            <h3 className="section-title"><i className="fa-solid fa-briefcase"></i> Gross Annual Income</h3>
            <SliderInput
              id="gross-salary"
              label="Gross Annual Salary"
              tooltip="Your annual basic salary + allowances before deductions. Standard deduction of ₹75k (New) or ₹50k (Old) will be automatically applied."
              value={grossSalary}
              onChange={setGrossSalary}
              min={0}
              max={grossSalary > 10000000 ? 40000000 : 10000000}
              step={grossSalary > 10000000 ? 200000 : 50000}
              labels={grossSalary > 10000000 ? ['₹0', '2 Cr', '4 Cr (Max)'] : ['₹0', '50L', '1 Cr+']}
            />

            <SliderInput
              id="employer-nps"
              label="Employer NPS Contribution"
              tooltip="Section 80CCD(2) - Up to 10% of Basic + DA. Deductible in both regimes."
              value={employerNps}
              onChange={setEmployerNps}
              min={0}
              max={250000}
              step={5000}
              labels={['₹0', '1.25L', '2.5L']}
            />
          </div>

          {/* Deductions (Old Regime Only) */}
          <div className="form-section">
            <h3 className="section-title"><i className="fa-solid fa-shield-halved"></i> Deductions (Old Regime)</h3>

            <SliderInput
              id="ded-80c"
              label="Section 80C"
              tooltip="EPF, PPF, ELSS, LIC, Principal on Home Loan, School fees. Maximum ₹1.5 Lakh."
              value={ded80c}
              onChange={setDed80c}
              min={0}
              max={150000}
              step={5000}
              labels={['₹0', '75k', '1.5L (Max)']}
            />

            <SliderInput
              id="ded-80d"
              label={label80d}
              tooltip={tooltip80d}
              value={ded80d}
              onChange={setDed80d}
              min={0}
              max={max80d}
              step={5000}
              labels={labels80d}
            />

            <SliderInput
              id="ded-hra"
              label="House Rent Allowance (HRA)"
              tooltip="Tax-exempt portion of rent allowance. Click 'Estimate HRA' below to calculate."
              value={dedHra}
              onChange={setDedHra}
              min={0}
              max={500000}
              step={5000}
              labels={['₹0', '2.5L', '5L']}
              actionButton={
                <button
                  type="button"
                  className="text-action-btn"
                  id="toggle-hra-calc"
                  onClick={() => setIsHraWidgetOpen(!isHraWidgetOpen)}
                >
                  <i className="fa-solid fa-calculator"></i> Estimate HRA
                </button>
              }
            />

            <SliderInput
              id="ded-24b"
              label="Section 24(b) (Home Loan Interest)"
              tooltip="Interest paid on self-occupied housing loan. Maximum ₹2 Lakh."
              value={ded24b}
              onChange={setDed24b}
              min={0}
              max={200000}
              step={5000}
              labels={['₹0', '1L', '2L (Max)']}
            />

            <SliderInput
              id="ded-nps"
              label="Section 80CCD(1B) (Self NPS)"
              tooltip="Additional voluntary NPS investments over and above 80C. Maximum ₹50,000."
              value={dedNps}
              onChange={setDedNps}
              min={0}
              max={50000}
              step={5000}
              labels={['₹0', '25k', '50k (Max)']}
            />

            <SliderInput
              id="ded-80tta"
              label={label80tta}
              tooltip={tooltip80tta}
              value={ded80tta}
              onChange={setDed80tta}
              min={0}
              max={max80tta}
              step={500}
              labels={labels80tta}
            />

            <SliderInput
              id="ded-other"
              label="Other Deductions"
              tooltip="LTA, 80E (Education Loan Interest), 80G (Donations)."
              value={dedOther}
              onChange={setDedOther}
              min={0}
              max={200000}
              step={5000}
              labels={['₹0', '1L', '2L']}
            />
          </div>

          {/* Advanced specialized panel section */}
          <div className="form-section">
            <div 
              className="section-header-row clickable-header" 
              onClick={() => setIsSpecialPanelOpen(!isSpecialPanelOpen)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 className="section-title">
                <i className="fa-solid fa-graduation-cap"></i> Special Profiles &amp; Deductions
              </h3>
              <span className="collapse-icon">
                <i className={`fa-solid ${isSpecialPanelOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: 'var(--color-primary)' }}></i>
              </span>
            </div>

            {isSpecialPanelOpen && (
              <div className="special-panel-content" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* 1. Differently Abled */}
                <div className="checkbox-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isDiffAbled} 
                      onChange={(e) => {
                        setIsDiffAbled(e.target.checked);
                        if (e.target.checked && disabilityLevel === 'none') {
                          setDisabilityLevel('normal');
                        } else if (!e.target.checked) {
                          setDisabilityLevel('none');
                        }
                      }} 
                    />
                    Diff-Abled Employee (Sec 80U / Transport Exemption)
                  </label>
                  {isDiffAbled && (
                    <div className="sub-settings-block" style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>DISABILITY SEVERITY</label>
                      <div className="segment-control minified">
                        <button
                          type="button"
                          className={`segment-btn ${disabilityLevel === 'normal' ? 'active' : ''}`}
                          onClick={() => setDisabilityLevel('normal')}
                        >
                          Normal (40-80%)
                        </button>
                        <button
                          type="button"
                          className={`segment-btn ${disabilityLevel === 'severe' ? 'active' : ''}`}
                          onClick={() => setDisabilityLevel('severe')}
                        >
                          Severe (80%+)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Caregiver Disabled Dependent */}
                <div className="checkbox-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={hasDisabledDependent} 
                      onChange={(e) => {
                        setHasDisabledDependent(e.target.checked);
                        if (e.target.checked && dependentDisabilityLevel === 'none') {
                          setDependentDisabilityLevel('normal');
                        } else if (!e.target.checked) {
                          setDependentDisabilityLevel('none');
                        }
                      }} 
                    />
                    Supporting a Disabled Dependent / Child (Sec 80DD Caregiver)
                  </label>
                  {hasDisabledDependent && (
                    <div className="sub-settings-block" style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>DEPENDENT SEVERITY</label>
                      <div className="segment-control minified">
                        <button
                          type="button"
                          className={`segment-btn ${dependentDisabilityLevel === 'normal' ? 'active' : ''}`}
                          onClick={() => setDependentDisabilityLevel('normal')}
                        >
                          Normal (40-80%)
                        </button>
                        <button
                          type="button"
                          className={`segment-btn ${dependentDisabilityLevel === 'severe' ? 'active' : ''}`}
                          onClick={() => setDependentDisabilityLevel('severe')}
                        >
                          Severe (80%+)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Widow / Family Pensioner */}
                <div className="checkbox-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={!isDefenseExempt && familyPension > 0} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIsDefenseExempt(false);
                          if (familyPension === 0) setFamilyPension(150000);
                        } else {
                          setFamilyPension(0);
                        }
                      }} 
                    />
                    Widow / Family Pensioner (Sec 57(iia) standard deduction)
                  </label>
                  {!isDefenseExempt && familyPension > 0 && (
                    <div className="sub-settings-block" style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="input-field-wrapper" style={{ margin: 0 }}>
                        <div className="input-label-row">
                          <label>Annual Family Pension</label>
                          <div className="numeric-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input 
                              type="number" 
                              value={familyPension} 
                              onChange={(e) => setFamilyPension(parseInt(e.target.value) || 0)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Defense Personnel / Gallantry Awardee */}
                <div className="checkbox-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isDefenseExempt} 
                      onChange={(e) => {
                        setIsDefenseExempt(e.target.checked);
                        if (e.target.checked) {
                          if (familyPension === 0) setFamilyPension(150000);
                        } else {
                          setFamilyPension(0);
                        }
                      }} 
                    />
                    Defense Personnel / Gallantry Awardee (Sec 10(18)/(19) Exemption)
                  </label>
                  {isDefenseExempt && (
                    <div className="sub-settings-block" style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="input-field-wrapper" style={{ margin: 0 }}>
                        <div className="input-label-row">
                          <label>Annual Defense / Gallantry Pension</label>
                          <div className="numeric-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input 
                              type="number" 
                              value={familyPension} 
                              onChange={(e) => setFamilyPension(parseInt(e.target.value) || 0)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Freelancer / Self-Employed */}
                <div className="checkbox-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={sec80ggRent > 0} 
                      onChange={(e) => setSec80ggRent(e.target.checked ? 120000 : 0)} 
                    />
                    Freelancer / Self-Employed (Sec 80GG Rent Deduction)
                  </label>
                  {sec80ggRent > 0 && (
                    <div className="sub-settings-block" style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SliderInput
                        id="sec80gg-rent"
                        label="Freelancer Rent Paid (Sec 80GG)"
                        tooltip="Claim rent deduction under Sec 80GG if you do not receive HRA. Capped dynamically in calculation."
                        value={sec80ggRent}
                        onChange={setSec80ggRent}
                        min={0}
                        max={240000}
                        step={5000}
                        labels={['₹0', '1.2L', '2.4L']}
                      />
                    </div>
                  )}
                </div>

                {/* 5. Education Loan */}
                <SliderInput
                  id="sec80e-interest"
                  label="Education Loan Interest Paid (Sec 80E)"
                  tooltip="Section 80E allows a deduction for the entire interest paid on a loan for higher studies. Uncapped."
                  value={sec80eInterest}
                  onChange={setSec80eInterest}
                  min={0}
                  max={300000}
                  step={5000}
                  labels={['₹0', '1.5L', '3L']}
                />

                {/* 6. First-time buyer */}
                <SliderInput
                  id="sec80eea-interest"
                  label="First-Time Buyer Interest (Sec 80EEA)"
                  tooltip="Additional home loan interest deduction up to ₹1.5 Lakh. Loan sanctioned 2019-2022."
                  value={sec80eeaInterest}
                  onChange={setSec80eeaInterest}
                  min={0}
                  max={150000}
                  step={5000}
                  labels={['₹0', '75k', '1.5L (Max)']}
                />

                {/* 7. Donations */}
                <SliderInput
                  id="donations-100"
                  label="100% Deductible Donations (Sec 80G)"
                  tooltip="Donations to PM Relief Fund, etc. that qualify for 100% tax deduction."
                  value={donations100}
                  onChange={setDonations100}
                  min={0}
                  max={100000}
                  step={5000}
                  labels={['₹0', '50k', '1L']}
                />

                <SliderInput
                  id="donations-50"
                  label="50% Deductible Donations (Sec 80G)"
                  tooltip="Donations to approved NGOs/Trusts that qualify for 50% tax deduction."
                  value={donations50}
                  onChange={setDonations50}
                  min={0}
                  max={100000}
                  step={5000}
                  labels={['₹0', '50k', '1L']}
                />

                {/* 8. EV Loan Interest (Sec 80EEB) */}
                <SliderInput
                  id="sec80eeb-interest"
                  label="EV Loan Interest Paid (Sec 80EEB)"
                  tooltip="Deduction on interest paid for an electric vehicle loan. Maximum ₹1.5 Lakh."
                  value={sec80eeb}
                  onChange={setSec80eeb}
                  min={0}
                  max={150000}
                  step={5000}
                  labels={['₹0', '75k', '1.5L (Max)']}
                />

                {/* 9. Vehicle Purchase (Sec 206C(1F)) */}
                <SliderInput
                  id="vehicle-purchase-price"
                  label="High-Value Vehicle Purchase (Sec 206C(1F))"
                  tooltip="Purchase price of motor vehicle. Buying vehicles above ₹10 Lakhs collects 1% TCS credit to offset final tax payable."
                  value={vehiclePrice}
                  onChange={setVehiclePrice}
                  min={0}
                  max={10000000}
                  step={100000}
                  labels={['₹0', '50L', '1 Cr (Max)']}
                />

              </div>
            )}
          </div>

          {/* Capital Gains & Portfolio Harvest Section */}
          <div className="form-section">
            <div 
              className="section-header-row clickable-header" 
              onClick={() => setIsCapitalGainsOpen(!isCapitalGainsOpen)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 className="section-title">
                <i className="fa-solid fa-chart-line"></i> Capital Gains &amp; Portfolio Harvest
              </h3>
              <span className="collapse-icon">
                <i className={`fa-solid ${isCapitalGainsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: 'var(--color-primary)' }}></i>
              </span>
            </div>

            {isCapitalGainsOpen && (
              <div className="special-panel-content" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* Short-Term Capital Gains (STCG) */}
                <SliderInput
                  id="stcg-equities"
                  label="Short-Term Capital Gains (Sec 111A)"
                  tooltip="Short-term capital gains on listed equity shares and equity-oriented mutual funds (taxed at 20%)."
                  value={stcgEquities}
                  onChange={setStcgEquities}
                  min={0}
                  max={1000000}
                  step={10000}
                  labels={['₹0', '5L', '10L (Max)']}
                />

                {/* Long-Term Capital Gains (LTCG) */}
                <SliderInput
                  id="ltcg-equities"
                  label="Long-Term Capital Gains (Sec 112A)"
                  tooltip="Long-term capital gains on listed equity shares. Taxed at 12.5% on gains exceeding ₹1.25 Lakhs per year."
                  value={ltcgEquities}
                  onChange={setLtcgEquities}
                  min={0}
                  max={2000000}
                  step={20000}
                  labels={['₹0', '10L', '20L (Max)']}
                />

                {/* Unrealized Portfolio Losses */}
                <SliderInput
                  id="unrealized-losses"
                  label="Unrealized Portfolio Losses (For Harvesting)"
                  tooltip="Paper losses currently in your portfolio. You can sell these assets before March 31st to book losses and offset capital gains tax."
                  value={unrealizedLosses}
                  onChange={setUnrealizedLosses}
                  min={0}
                  max={1000000}
                  step={10000}
                  labels={['₹0', '5L', '10L (Max)']}
                />

              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Results & Analytics */}
        <section className="results-panel">
          
          {/* Optimal verdict banner */}
          <VerdictCard
            verdict={result.verdict}
            savings={result.savings}
            finalTaxNew={result.newRegime.finalTax}
          />

          {/* In-Hand Monthly Take home cards */}
          <TakeHomeCard
            monthlyOldTakeHome={result.oldRegime.monthlyTakeHome}
            monthlyNewTakeHome={result.newRegime.monthlyTakeHome}
          />

          {/* Crossover threshold visualizer */}
          <CrossoverVisualizer
            currentDeductions={result.oldRegime.otherDeductions}
            requiredDeductions={result.crossoverDeductions}
            grossSalary={grossSalary}
          />

          {/* SVG Tax Comparison Chart */}
          <div className="chart-container glass-panel">
            <h3>Tax Liability Comparison</h3>
            <TaxChart
              taxOld={result.oldRegime.finalTax}
              taxNew={result.newRegime.finalTax}
            />
            <div className="chart-legend">
              <div className="legend-item"><span className="legend-color old-color"></span> Old Regime</div>
              <div className="legend-item"><span className="legend-color new-color"></span> New Regime</div>
            </div>
          </div>

          {/* Slab-by-slab breakdown table */}
          <div className="table-container glass-panel">
            <h3>Detailed Slab Comparison</h3>
            <BreakdownTable
              oldBreakdown={result.oldRegime}
              newBreakdown={result.newRegime}
            />
          </div>

          {/* Free download report CTA */}
          <div className="premium-cta-card glass-panel">
            <div className="premium-glow"></div>
            <div className="premium-badge-row">
              <span className="premium-tag"><i className="fa-solid fa-sparkles"></i> RECOMMENDATION OPTIMIZER</span>
            </div>
            <h2>Get Your Personalized Tax Saving Blueprint</h2>
            <p>Download your comprehensive 5-page custom report with smart investment allocations, CA-ready signature sheet, and key filing checklists.</p>
            <div className="premium-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                <button 
                  className="btn accent-btn glow-effect" 
                  id="download-report-btn"
                  onClick={handleDownload}
                  style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <i className="fa-solid fa-download"></i> Download Tax Blueprint (Free)
                </button>
              </div>
              <button 
                type="button" 
                className="text-action-btn" 
                id="view-sample-btn"
                onClick={() => setIsPreviewOpen(true)}
                style={{ alignSelf: 'center' }}
              >
                <i className="fa-solid fa-file-invoice"></i> Preview Blueprint
              </button>
            </div>
          </div>

          {/* Dynamic saving advisory recommendations */}
          <OptimizerInsights
            inputs={inputs}
            result={result}
          />

        </section>
      </main>

      {/* SEO Article & FAQs Section */}
      <section className="seo-content-section glass-panel">
        <h2>Understanding Income Tax Slabs in India (FY 2025-26 / AY 2026-27)</h2>
        <p>Choosing between the <strong>Old Tax Regime</strong> and the default <strong>New Tax Regime</strong> is critical for tax planning. For the assessment year 2026-27, the Indian government has structured the slabs differently under both options.</p>

        <div className="seo-grid">
          {/* Slabs Table New */}
          <div className="seo-table-box">
            <h3>New Tax Regime Slabs (Default)</h3>
            <table className="seo-slabs-table">
              <thead>
                <tr>
                  <th>Income Range</th>
                  <th>Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Up to ₹4,00,000</td>
                  <td>Nil (0%)</td>
                </tr>
                <tr>
                  <td>₹4,00,001 to ₹8,00,000</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td>₹8,00,001 to ₹12,00,000</td>
                  <td>10%</td>
                </tr>
                <tr>
                  <td>₹12,00,001 to ₹16,00,000</td>
                  <td>15%</td>
                </tr>
                <tr>
                  <td>₹16,00,001 to ₹20,00,000</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td>₹20,00,001 to ₹24,00,000</td>
                  <td>25%</td>
                </tr>
                <tr>
                  <td>Above ₹24,00,000</td>
                  <td>30%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Slabs Table Old */}
          <div className="seo-table-box">
            <h3>Old Tax Regime Slabs (Optional)</h3>
            <table className="seo-slabs-table">
              <thead>
                <tr>
                  <th>Income Range</th>
                  <th>Tax Rate (General &lt; 60)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Up to ₹2,50,000</td>
                  <td>Nil (0%)</td>
                </tr>
                <tr>
                  <td>₹2,50,001 to ₹5,00,000</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td>₹5,00,001 to ₹10,00,000</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td>Above ₹10,00,000</td>
                  <td>30%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="seo-faqs">
          <h3>Frequently Asked Questions (FAQs)</h3>
          
          <details className="faq-item">
            <summary>What is standard deduction in FY 2025-26?</summary>
            <div className="faq-answer">
              <p>For salaried individuals, a standard deduction of <strong>₹75,000</strong> is applicable under the default New Tax Regime. For taxpayers opting for the Old Tax Regime, the standard deduction is capped at <strong>₹50,000</strong>.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary>How does Section 87A rebate work under both regimes?</summary>
            <div className="faq-answer">
              <p>Under the New Tax Regime, resident individuals with net taxable income up to <strong>₹12 Lakh</strong> effectively pay ₹0 tax due to the Section 87A rebate. Under the Old Tax Regime, the rebate applies only for net taxable income up to <strong>₹5 Lakh</strong>.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary>Is HRA and Home Loan interest allowed in the New Tax Regime?</summary>
            <div className="faq-answer">
              <p>No, exemptions for House Rent Allowance (HRA) and interest paid on self-occupied home loans (Section 24b) are <strong>only allowed under the Old Tax Regime</strong>. Under the New Regime, these are forgone in exchange for lower tax slab rates.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary>What is the surcharge rate under the default New Regime?</summary>
            <div className="faq-answer">
              <p>For taxable incomes exceeding ₹50 Lakh, surcharges are applied. In the New Tax Regime, the highest surcharge tier is capped at <strong>25%</strong> for income above ₹5 Crore, whereas in the Old Tax Regime it goes up to <strong>37%</strong>.</p>
            </div>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2026 TaxOptima. All rights reserved. Designed for optimal financial planning.</p>
      </footer>

      {/* PDF Previewer Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        inputs={inputs}
        result={result}
      />

      {/* HRA Calculator Modal */}
      <HraCalculatorWidget
        isOpen={isHraWidgetOpen}
        onClose={() => setIsHraWidgetOpen(false)}
        onApply={(val) => {
          setDedHra(val);
          setIsHraWidgetOpen(false);
        }}
      />
    </div>

    {/* Hidden Print Container */}
    <PrintReport inputs={inputs} result={result} />
  </>
  );
}

export default App;
