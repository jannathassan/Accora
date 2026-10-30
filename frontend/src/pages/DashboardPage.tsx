import { Link } from 'react-router-dom';
import { useMoneyStore } from '../store/moneyStore';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const {
    activePersonaKey,
    balance,
    monthIn,
    monthOut,
    monthKept,
    health,
    bills,
    invoices,
    committees,
    alerts,
    checklist,
    transactions,
    foreignBankShare,
    taxRate,
  } = useMoneyStore();

  // 6 Months In vs Out for Chart
  const chartData: { month: string; in: number; out: number }[] = [];

  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const ym = d.toISOString().slice(0, 7);
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });

    const totalIn = transactions
      .filter((t) => t.type === 'in' && t.date.slice(0, 7) === ym)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = transactions
      .filter((t) => t.type === 'out' && t.date.slice(0, 7) === ym)
      .reduce((sum, t) => sum + t.amount, 0);

    chartData.push({
      month: monthName,
      in: totalIn,
      out: totalOut,
    });
  }

  // Checklist progress (5 items)
  const checklistItems = [
    { key: 'firstIncomeAdded', label: 'Add first income', done: checklist.firstIncomeAdded },
    { key: 'firstSpendingAdded', label: 'Add first spending', done: checklist.firstSpendingAdded },
    { key: 'budgetSet', label: 'Set a budget', done: checklist.budgetSet },
    { key: 'questionAsked', label: 'Ask ACCORA a question', done: checklist.questionAsked },
    { key: 'affordabilityChecked', label: 'Try “Can I Afford It?”', done: checklist.affordabilityChecked },
  ];
  const completedCount = checklistItems.filter((c) => c.done).length;

  const upcomingBills = bills.filter((b) => !b.paid).slice(0, 3);
  const unpaidInvoices = invoices.filter((i) => !i.paid);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839] tracking-tight">
            My Money Dashboard
          </h1>
          <p className="text-sm text-[#5B6785] mt-1">
            Your money at a glance. Everything updates automatically when you add an entry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/transactions"
            className="btn-lime text-xs py-2 px-4 shadow-2xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Entry</span>
          </Link>
          <Link
            to="/app/ask"
            className="btn-outline text-xs py-2 px-3.5 bg-white"
          >
            <span>Ask ACCORA</span>
          </Link>
        </div>
      </div>

      {/* ── "Get Started" 5-Step Checklist (Section 5) ── */}
      {completedCount < 5 && (
        <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1D2839]">
              Get started: {completedCount} of 5 done
            </span>
            <span className="text-[#0B5CE6] font-semibold">
              {completedCount * 20}% completed
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#E2E8F7] overflow-hidden">
            <div
              className="h-full bg-[#0B5CE6] transition-all duration-300"
              style={{ width: `${completedCount * 20}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#5B6785] pt-1">
            {checklistItems.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#A3D508] shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#5B6785] inline-block shrink-0" />
                )}
                <span className={item.done ? 'text-[#1D2839] font-medium' : ''}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 4 Main KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money In */}
        <div className="accora-card bg-white border-[#E2E8F7] p-5">
          <div className="flex items-center justify-between text-xs text-[#5B6785] font-semibold mb-1">
            <span>Money in (this month)</span>
            <TrendingUp className="w-4 h-4 text-[#A3D508]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D2839] tabular-nums">
            PKR {monthIn.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5B6785] mt-1">
            Total recorded inflows
          </p>
        </div>

        {/* Money Out */}
        <div className="accora-card bg-white border-[#E2E8F7] p-5">
          <div className="flex items-center justify-between text-xs text-[#5B6785] font-semibold mb-1">
            <span>Money out (this month)</span>
            <TrendingDown className="w-4 h-4 text-[#FD614F]" />
          </div>
          <div className="text-2xl font-extrabold text-[#FD614F] tabular-nums">
            PKR {monthOut.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5B6785] mt-1">
            Total spending & bills
          </p>
        </div>

        {/* Kept this Month */}
        <div className="accora-card bg-white border-[#E2E8F7] p-5">
          <div className="flex items-center justify-between text-xs text-[#5B6785] font-semibold mb-1">
            <span>Kept this month</span>
            <PiggyBank className="w-4 h-4 text-[#0B5CE6]" />
          </div>
          <div className={`text-2xl font-extrabold tabular-nums ${monthKept >= 0 ? 'text-[#0B5CE6]' : 'text-[#FD614F]'}`}>
            {monthKept >= 0 ? '+' : ''}PKR {monthKept.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5B6785] mt-1">
            {monthKept >= 0 ? 'Net savings surplus' : 'Operating cash deficit'}
          </p>
        </div>

        {/* Total Money Available */}
        <div className="accora-card bg-white border-[#E2E8F7] p-5">
          <div className="flex items-center justify-between text-xs text-[#5B6785] font-semibold mb-1">
            <span>Money you have</span>
            <Wallet className="w-4 h-4 text-[#1D2839]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D2839] tabular-nums">
            PKR {balance.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5B6785] mt-1">
            Cash, bank, and wallet total
          </p>
        </div>
      </div>

      {/* ── Health Score & Alerts Bell Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Health Score Card */}
        <div
          className={`accora-card border p-6 ${
            health.verdict === 'healthy'
              ? 'bg-[#f3fbd9]/40 border-[#A3D508]'
              : health.verdict === 'warning'
              ? 'bg-[#fff9e6]/50 border-[#f79009]'
              : 'bg-[#ffefed]/50 border-[#FD614F]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6785]">
                  Money Health Score
                </span>
                <span
                  title="A simple score from 0 to 100 based on how much of your monthly income you keep."
                  className="text-xs text-[#5B6785] cursor-help"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-4xl font-extrabold text-[#1D2839] mt-2">
                {health.score} <span className="text-lg font-normal text-[#5B6785]">/ 100</span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border border-[#E2E8F7]">
              {health.verdict === 'healthy' && 'Healthy'}
              {health.verdict === 'warning' && 'Attention'}
              {health.verdict === 'risk' && 'High Risk'}
            </div>
          </div>

          <p className="text-sm text-[#1D2839] font-medium mt-3 leading-relaxed">
            {health.summary}
          </p>

          <div className="mt-4 pt-3 border-t border-[#E2E8F7] space-y-1.5">
            <span className="text-[11px] font-bold text-[#5B6785] uppercase tracking-wider block">
              3 Helpful Tips:
            </span>
            {health.tips.map((tip, idx) => (
              <p key={idx} className="text-xs text-[#1D2839] flex items-start gap-2">
                <span className="text-[#0B5CE6] font-bold">•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        </div>

        {/* 🔔 Alerts Bell Card */}
        <div className="accora-card bg-white border-[#E2E8F7] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D2839] flex items-center gap-2">
              <span>🔔</span>
              <span>Alerts & Notifications</span>
            </h2>
            <span className="text-xs text-[#5B6785]">
              {alerts.length} active
            </span>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {alerts.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] text-xs text-[#1D2839] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#FD614F] shrink-0 mt-0.5" />
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#5B6785] text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#A3D508] mx-auto mb-2" />
              <p className="font-semibold text-[#1D2839]">All clear!</p>
              <p>Nothing needs your attention right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 6-Month In vs. Out Bar Chart ── */}
      <div className="accora-card bg-white border-[#E2E8F7] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1D2839]">
              Last 6 Months (Money In vs. Money Out)
            </h2>
            <p className="text-xs text-[#5B6785]">Amounts in Pakistani Rupee (PKR)</p>
          </div>
          <Link
            to="/app/forecast"
            className="text-xs font-bold text-[#0B5CE6] hover:underline flex items-center gap-1"
          >
            <span>See Future Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F7" />
              <XAxis dataKey="month" stroke="#5B6785" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#5B6785"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `PKR ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7', fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => (value === 'in' ? 'Money In' : 'Money Out')}
              />
              <Bar dataKey="in" name="in" fill="#A3D508" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" name="out" fill="#FD614F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Section: Coming Up & Persona-Specific Widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Bills */}
        <div className="accora-card bg-white border-[#E2E8F7] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D2839]">
              Coming Up (Unpaid Bills)
            </h2>
            <Link to="/app/invoices" className="text-xs text-[#0B5CE6] font-semibold hover:underline">
              View all
            </Link>
          </div>

          {upcomingBills.length > 0 ? (
            <div className="space-y-3">
              {upcomingBills.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-[#1D2839]">{b.name}</h3>
                    <p className="text-[11px] text-[#5B6785] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Due on {b.dueDate}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-[#FD614F]">
                    PKR {b.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5B6785] py-4 text-center">
              No unpaid bills coming up.
            </p>
          )}
        </div>

        {/* Persona-Tailored Widget */}
        <div className="accora-card bg-white border-[#E2E8F7] p-6 space-y-4">
          {activePersonaKey === 'shop' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1D2839]">Wholesale Receivables</h2>
                <Link to="/app/invoices" className="text-xs text-[#0B5CE6] font-semibold hover:underline">
                  Invoices
                </Link>
              </div>
              <p className="text-xs text-[#5B6785]">Clients who owe your shop payment:</p>
              {unpaidInvoices.map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-[#1D2839] block">{inv.client}</strong>
                    <span className="text-[11px] text-[#5B6785]">Due: {inv.dueDate}</span>
                  </div>
                  <span className="font-bold text-[#0B5CE6]">PKR {inv.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {activePersonaKey === 'free' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#1D2839]">Freelancer FBR Set-Aside</h2>
              <p className="text-xs text-[#5B6785]">
                {foreignBankShare}% of payments received through banking channels. Set aside ~{taxRate}% for annual filing.
              </p>
              <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex justify-between items-center">
                <span className="text-xs text-[#1D2839] font-medium">Estimated tax set-aside:</span>
                <strong className="text-sm text-[#0B5CE6]">PKR {Math.round(monthIn * (taxRate / 100)).toLocaleString()}</strong>
              </div>
              <Link to="/app/tax" className="btn-outline text-xs py-2 w-full text-center block">
                Open Tax Helper
              </Link>
            </div>
          )}

          {activePersonaKey === 'home' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#1D2839]">Family Committee (Kameti)</h2>
              {committees.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-[#1D2839]">
                    <span>{committees[0].name}</span>
                    <span>PKR {committees[0].monthlyAmount.toLocaleString()} / mo</span>
                  </div>
                  <p className="text-[#5B6785]">
                    Your payout turn: <strong>Month #{committees[0].myTurn}</strong> (Payout: PKR {(committees[0].monthlyAmount * committees[0].members).toLocaleString()})
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#5B6785]">No active committee.</p>
              )}
              <Link to="/app/committee" className="btn-outline text-xs py-2 w-full text-center block">
                Manage Committees
              </Link>
            </div>
          )}

          {activePersonaKey === 'pro' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#1D2839]">Monthly Budget Health</h2>
              <p className="text-xs text-[#5B6785]">
                Your monthly house rent and family groceries are on track. Aim to keep PKR 30,000+ each month for savings goals.
              </p>
              <Link to="/app/budgets" className="btn-outline text-xs py-2 w-full text-center block">
                View Budget &amp; Goals
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
