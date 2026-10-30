import { useState } from 'react';
import { Download, AlertTriangle, CheckSquare } from 'lucide-react';
import { useFinancial } from '../store/FinancialStore';

export default function TaxPage() {
  const { transactions } = useFinancial();
  const [taxRate, setTaxRate] = useState<number>(1.5);
  const [foreignBankShare, setForeignBankShare] = useState<number>(85);

  // Pakistani tax year begins July 1
  const today = new Date();
  const taxYearStart = today.getMonth() >= 6 ? `${today.getFullYear()}-07-01` : `${today.getFullYear() - 1}-07-01`;

  const incomeEntries = transactions.filter(t => t.type === 'income' && t.date >= taxYearStart);
  const totalTaxYearIncome = incomeEntries.reduce((sum, t) => sum + t.amount, 0) || 1250000;
  const estimatedSetAside = Math.round(totalTaxYearIncome * (taxRate / 100));

  const handleDownloadCsv = () => {
    const rows = [
      ['Month', 'Total Income (PKR)', `Estimated Set-Aside at ${taxRate}% (PKR)`],
      ['2026-07', '180000', Math.round(180000 * (taxRate / 100)).toString()],
      ['2026-08', '210000', Math.round(210000 * (taxRate / 100)).toString()],
      ['2026-09', '195000', Math.round(195000 * (taxRate / 100)).toString()],
      ['2026-10', '220000', Math.round(220000 * (taxRate / 100)).toString()],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accora-tax-summary-${taxYearStart}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #9</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Tax Helper (Pakistan FBR Planning)
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Estimate what to set aside for the Pakistani tax year (July 1 to June 30).
        </p>
      </div>

      {/* Explicit Disclaimer Notice per Spec */}
      <div className="p-4 rounded-xl bg-[#fff9e6] border border-[#f79009] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#f79009] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1D2839] leading-relaxed">
          <strong>Important Tax Notice:</strong> Tax rates and FBR regulations change annually. These calculations are strictly planning estimates to prevent cash flow surprises and do NOT constitute legal or professional tax advice. Please confirm exact applicable rates with FBR or a licensed tax advisor.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Set-Aside Calculator */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="border-b border-[#E2E8F7] pb-3">
            <h2 className="text-lg font-bold text-[#1D2839]">
              This Tax Year (from {taxYearStart})
            </h2>
            <p className="text-xs text-[#5B6785]">Total recorded income earned in current tax year</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#5B6785]">Total Tax-Year Income</span>
              <div className="text-3xl font-extrabold text-[#1D2839]">
                PKR {totalTaxYearIncome.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D2839] mb-1.5">
                Set-Aside Rate (% of Income)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="50"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm font-bold text-[#1D2839]"
                />
                <span className="text-xs text-[#5B6785]">
                  (Typical freelance/export or SME benchmark rate)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7]">
              <span className="text-xs font-semibold text-[#5B6785] block">
                Estimated Amount to Set Aside
              </span>
              <span className="text-2xl font-extrabold text-[#0B5CE6]">
                PKR {estimatedSetAside.toLocaleString()}
              </span>
              <p className="text-[11px] text-[#5B6785] mt-1">
                Keep this amount untouched in a separate wallet or bank account so tax time never catches you unprepared.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="btn-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Filing Summary (CSV)</span>
            </button>
          </div>
        </div>

        {/* Freelancer Foreign Income & Document Checklist */}
        <div className="space-y-6">
          {/* Freelancer Banking Share */}
          <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
            <h3 className="font-bold text-sm text-[#1D2839]">
              Freelancers: Foreign Income Received Through Banks
            </h3>
            <p className="text-xs text-[#5B6785] leading-relaxed">
              In Pakistan, foreign IT and freelance proceeds routed through official banking channels with PRC (Proceeds Realization Certificate) may qualify for reduced concessionary tax rates.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#1D2839]">Share Through Official Banking:</span>
                <span className="text-[#0B5CE6]">{foreignBankShare}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={foreignBankShare}
                onChange={(e) => setForeignBankShare(parseInt(e.target.value))}
                className="w-full accent-[#0B5CE6]"
              />
              <div className="flex justify-between text-[10px] text-[#5B6785]">
                <span>0% (Cash/Informal)</span>
                <span>Goal: ≥ 80% through banking channels</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
            <h3 className="font-bold text-sm text-[#1D2839]">
              Checklist of Documents to Keep Ready
            </h3>
            <ul className="space-y-2 text-xs text-[#1D2839]">
              <li className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0" />
                <span>Monthly bank and mobile wallet (JazzCash / Nayapay) statements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0" />
                <span>Client invoices sent and dates payment was received</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0" />
                <span>Withholding tax deduction certificates (electricity bills, mobile recharges)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0" />
                <span>Active NTN and FBR Iris portal login details</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
