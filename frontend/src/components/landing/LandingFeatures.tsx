import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Target,
  Users,
  FileText,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export default function LandingFeatures() {
  const tools = [
    {
      num: 1,
      name: 'My Money Dashboard',
      icon: LayoutDashboard,
      desc: 'This month’s money in, money out, and kept. Includes a 0–100 health score with plain-English tips and an alerts bell.',
      highlight: 'Health score & upcoming bills',
    },
    {
      num: 2,
      name: 'Income & Spending Tracker',
      icon: Receipt,
      desc: 'Add what comes in and goes out with 1 click. Notes auto-guess your category. Monthly repeats, search, and CSV export.',
      highlight: 'Smart category auto-guess',
    },
    {
      num: 3,
      name: 'Bills & Invoices',
      icon: FileSpreadsheet,
      desc: 'Two clear tabs: money owed to you with 1-click WhatsApp reminders and PDF downloads, plus bills you must pay.',
      highlight: 'WhatsApp polite reminder button',
    },
    {
      num: 4,
      name: 'Future Forecast',
      icon: TrendingUp,
      desc: 'See the next 3 or 6 months based on your real habits. Plain sentences tell you if cash will grow or run low.',
      highlight: '3 & 6-month projection line',
    },
    {
      num: 5,
      name: '“Can I Afford It?”',
      icon: HelpCircle,
      desc: 'Test a big decision before spending: purchases, new rent, weeks without income, or drops. Clear Yes / Be careful / Not now verdict.',
      highlight: 'Clear verdict with months of cash runway',
    },
    {
      num: 6,
      name: 'Ask ACCORA (AI Chat)',
      icon: MessageSquare,
      desc: 'Ask questions in everyday words. Every single number is calculated strictly from your own data with zero hallucinations.',
      highlight: 'Answers grounded in your numbers',
    },
    {
      num: 7,
      name: 'Budget & Savings Goals',
      icon: Target,
      desc: 'Set limits per category with progress bars that warn you at 80%. Track target savings with monthly contribution targets.',
      highlight: 'Visual alerts at 80% and 100%',
    },
    {
      num: 8,
      name: 'Committee (BC) Tracker',
      icon: Users,
      desc: 'Track traditional Pakistani kameti / committees. Shows what you pay and when you receive your payout turn.',
      highlight: 'Auto-built monthly schedule',
    },
    {
      num: 9,
      name: 'Tax Helper',
      icon: FileText,
      desc: 'Track Pakistani tax year (July–June) totals with an editable set-aside %. Freelancer bank remittance progress bar and CSV summary.',
      highlight: 'PKR tax year set-aside tracker',
    },
    {
      num: 10,
      name: 'Easy Upload',
      icon: UploadCloud,
      desc: 'Upload a bank or wallet CSV statement, preview auto-categorized rows, flag duplicates, and import with one click.',
      highlight: 'Statement preview & duplicate detection',
    },
  ];

  return (
    <section id="tools" className="py-16 sm:py-24 bg-white border-t border-b border-[#E2E8F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider">
            <span>Complete Suite</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1D2839] tracking-tight">
            10 simple tools in one app
          </h2>
          <p className="text-sm sm:text-base text-[#5B6785]">
            No missing pieces. Everything listed here works today with real calculations and zero fake numbers.
          </p>
        </div>

        {/* 10 Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.num}
                className="accora-card flex flex-col justify-between border-[#E2E8F7] hover:border-[#0B5CE6] hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F7FC] text-[#0B5CE6] flex items-center justify-center font-bold text-sm border border-[#E2E8F7] group-hover:bg-[#0B5CE6] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#5B6785] bg-[#F4F7FC] px-2.5 py-1 rounded-md">
                      Tool #{t.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1D2839] text-base group-hover:text-[#0B5CE6] transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[#5B6785] mt-1.5 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F7] flex items-center text-xs text-[#0B5CE6] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#A3D508]" />
                  <span>{t.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
