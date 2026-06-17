# 🇮🇳 TaxOptima

> A premium, interactive tax comparator & optimizer for the Indian Income Tax Regimes (FY 2025-26 / AY 2026-27).

TaxOptima is a high-performance, single-page client-side web application designed to help Indian taxpayers make informed decisions. It compares liabilities under the **Old Regime** against the default **New Regime** with real-time computations, custom demographic profiling, and advanced deduction break-even analysis.

---

## ⚡️ Key Features

- **Side-by-Side Regime Comparison:** Dynamic calculations across both tax regimes with precise calculations for standard deductions, Section 87A rebate, and marginal relief rules.
- **Break-Even Visualizer (Crossover Point):** Dynamically computes the exact threshold of deductions needed in the Old Regime using binary search to match the New Regime's liability.
- **Specialized Demographics Support:** Predefined tax profiles with automatic application of deductions/exemptions:
  - *Differently-Abled Employees* (Sec 80U deduction & Sec 10(14) transport exemptions)
  - *Caregivers / Parents* (Sec 80DD disability maintenance deductions)
  - *Widows & Pensioners* (Sec 57(iia) standard family pension deductions)
  - *Defense Personnel* (Sec 10(18)/(19) gallantry and casualty pension exemptions)
  - *Freelancers & Self-Employed* (Sec 80GG rent deductions)
- **Vehicle Tax Integrations:**
  - *EV Loan Interest (Sec 80EEB):* Deduct EV loan interest up to ₹1.5 Lakh under the Old Regime.
  - *Vehicle TCS Tax Credit (Sec 206C(1F)):* Automatically computes a 1% TCS credit for motor vehicles purchased above ₹10 Lakhs, directly offsetting final Net Tax Payable under both regimes.
- **HRA Calculator Modal:** A centered glassmorphic popup estimating HRA exemptions based on Basic+DA, rent, and city tier.
- **Free Blueprint Export:** Instant export of a comprehensive 5-page planning blueprint PDF (complete with client copies, CA sign-off sheets, and actionable checklists) accompanied by a celebration confetti burst.
- **Privacy First:** 100% client-side calculations. Your sensitive financial data never leaves your browser.

---

## 🛠️ Tech Stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Custom Vanilla CSS (featuring glassmorphism, responsive grid layouts, and smooth micro-animations)
- **Visuals:** Lightweight, zero-dependency inline SVGs and custom gauge meters
- **Export:** Dynamic loading of `html2pdf.js` and `canvas-confetti` to optimize initial bundle size

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

### Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/kashek85/NewTaxCalculator-India.git
   cd NewTaxCalculator-India
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Production Build:**
   ```bash
   npm run build
   ```
   The production-ready assets will be generated in the `dist/` directory.

---

## 🌐 Free Deployment

Deploy your own instance of TaxOptima in seconds:

### Deploy via Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New > Project** and import `kashek85/NewTaxCalculator-India`.
3. Click **Deploy**. Vercel will automatically build and serve the app on a secure URL.

### Deploy via Cloudflare Pages
1. Go to **Workers & Pages > Pages > Connect to Git** in Cloudflare.
2. Select this repository and set the framework preset to **Vite**.
3. Click **Save and Deploy**.
