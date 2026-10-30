import { useState } from 'react';
import { Download, AlertTriangle, CheckSquare, Info, ShieldCheck } from 'lucide-react';
import { useMoneyStore } from '../store/moneyStore';
import { calculateTaxSetAside } from '../utils/calculations';
import { sanitizeCsvField } from '../utils/format';

export default function TaxPage() {
  const { transactions, taxRate: defaultTaxRate, foreignBankShare: defaultForeignShare, activePersonaKey } = useMoneyStore();
  const [taxRate, setTaxRate] = useState<number>(defaultTaxRate || 1.5);
  const [foreignBankShare, setForeignBankShare] = useState<number>(defaultForeignShare || 85);

  const isFreelancer = activePersonaKey === 'free';

  const { taxYearStartDate, totalIncomeThisTaxYear, estimatedSetAside } = calculateTaxSetAside(
    transactions,
    taxRate
  );

  // Filter income entries in current tax year
  const taxYearIncomeEntries = transactions
    .filter((t) => t.type === 'in' && t.date >= taxYearStartDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by month for filing summary
  const monthlySummary: Record<string, { total: number; setAside: number; count: number }> = {};
  taxYearIncomeEntries.forEach((t) => {
    const ym = t.date.slice(0, 7);
    if (!monthlySummary[ym]) {
      monthlySummary[ym] = { total: 0, setAside: 0, count: 0 };
    }
    monthlySummary[ym].total += t.amount;
    monthlySummary[ym].setAside += Math.round(t.amount * (taxRate / 100));
    monthlySummary[ym].count += 1;
  });

  const handleDownloadCsv = () => {
    const headers = ['Month', 'Total Income (PKR)', `Estimated Set-Aside at ${taxRate}% (PKR)`, 'Transaction Count'];
    const rows = Object.entries(monthlySummary).map(([month, data]) => [
      sanitizeCsvField(month),
      sanitizeCsvField(data.total),
      sanitizeCsvField(data.setAside),
      sanitizeCsvField(data.count),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `# ACCORA Tax Filing Summary (Pakistani Tax Year starting ${taxYearStartDate})`,
        `# Disclaimer: Strictly a planning estimate; confirm with FBR or licensed tax advisor.`,
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accora-tax-summary-${taxYearStartDate}.csv`);
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
          Estimate what to set aside for the Pakistani tax year (July 1 to June 30) so you are never caught off guard.
        </p>
      </div>

      {/* Explicit Disclaimer per Spec */}
      <div className="p-4 rounded-xl bg-[#fff9e6] border border-[#f79009] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#f79009] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1D2839] leading-relaxed">
          <strong>Important Tax Notice:</strong> Tax rates and FBR regulations change annually. These calculations are strictly planning estimates to prevent cash flow surprises and do NOT constitute legal or professional tax advice. Please confirm exact applicable tax slabs with FBR or a licensed tax practitioner.
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Set-Aside Calculator */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="border-b border-[#E2E8F7] pb-3">
            <h2 className="text-lg font-bold text-[#1D2839]">
              This Tax Year (Starting July {taxYearStartDate.slice(0, 4)})
            </h2>
            <p className="text-xs text-[#5B6785]">
              Real calculated total from your recorded income
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#5B6785] font-semibold">Total Tax-Year Income Recorded</span>
              <div className="text-3xl font-extrabold text-[#1D2839] mt-0.5">
                PKR {totalIncomeThisTaxYear.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D2839] mb-1.5">
                Editable Set-Aside Rate (% of Income)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="45"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm font-bold text-[#1D2839] focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
                />
                <span className="text-xs text-[#5B6785]">
                  % (Typical: 0.25% - 1.0% PSEB IT export, 1.5% - 2.5% SME services)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-1">
              <span className="text-xs font-semibold text-[#5B6785] block">
                Recommended Amount to Set Aside
              </span>
              <span className="text-2xl font-extrabold text-[#0B5CE6]">
                PKR {estimatedSetAside.toLocaleString()}
              </span>
              <p className="text-[11px] text-[#5B6785] pt-1">
                Keep this amount untouched in a separate high-yield savings account or secondary wallet so year-end tax season is stress-free.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="btn-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Filing Summary (CSV)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Freelancer Foreign Income & Checklist */}
        <div className="space-y-6">
          
          {/* Freelancer Foreign Banking Channel Share (spec: for freelancers) */}
          {(isFreelancer || defaultForeignShare > 0) && (
            <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1D2839]">
                  Freelancer: Foreign Income via Official Banks
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f3fbd9] text-[#1D2839]">
                  {foreignBankShare}% Banking Share
                </span>
              </div>
              <p className="text-xs text-[#5B6785] leading-relaxed">
                In Pakistan, IT and freelance earnings remitted through official commercial banking channels with PRC (Proceeds Realization Certificate) may qualify for concessionary FBR tax rates under PSEB regimes.
              </p>

              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={foreignBankShare}
                  onChange={(e) => setForeignBankShare(parseInt(e.target.value))}
                  className="w-full accent-[#0B5CE6] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#5B6785]">
                  <span>0% (Cash/Informal)</span>
                  <span className="font-semibold text-[#0B5CE6]">Recommended Target: ≥ 80%</span>
                  <span>100% (Fully banked)</span>
                </div>
              </div>
            </div>
          )}

          {/* Document Checklist */}
          <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0B5CE6]" />
              <h3 className="font-bold text-sm text-[#1D2839]">
                Checklist of Documents to Keep Ready
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#1D2839]">
              <li className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0 mt-0.5" />
                <span>Monthly bank, Nayapay, or JazzCash statements with transaction notes</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0 mt-0.5" />
                <span>Client invoices sent and date payment cleared in bank account</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0 mt-0.5" />
                <span>Withholding tax deduction certificates (from electricity bills, mobile phone networks)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#A3D508] shrink-0 mt-0.5" />
                <span>Active NTN and FBR Iris portal login credentials</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Income Entries with Tax Set-Aside breakdown per entry */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F7]">
          <div>
            <h2 className="text-base font-bold text-[#1D2839]">
              Income Entries &amp; Set-Aside Breakdown ({taxYearIncomeEntries.length} entries)
            </h2>
            <p className="text-xs text-[#5B6785]">
              Shows exact amount to set aside per income receipt at {taxRate}%
            </p>
          </div>
          <div className="text-xs text-[#5B6785] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#0B5CE6]" />
            <span>Tax Year: July 1 to June 30</span>
          </div>
        </div>

        {taxYearIncomeEntries.length === 0 ? (
          <p className="text-xs text-[#5B6785] py-4 text-center">
            No income entries recorded in this tax year yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Source / Note</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Income (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Set-Aside ({taxRate}%)</th>
                </tr>
              </thead>
              <tbody>
                {taxYearIncomeEntries.slice(0, 10).map((t) => {
                  const entrySetAside = Math.round(t.amount * (taxRate / 100));
                  return (
                    <tr key={t.id} className="border-b border-[#E2E8F7]/60 hover:bg-[#F4F7FC]/30">
                      <td className="py-2.5 px-3 font-mono">{t.date}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1D2839]">{t.note}</td>
                      <td className="py-2.5 px-3 text-[#5B6785] capitalize">{t.account || 'bank'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1D2839]">
                        PKR {t.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0B5CE6]">
                        PKR {entrySetAside.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
