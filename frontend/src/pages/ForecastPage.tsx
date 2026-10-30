import { useState } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { calculateForecast } from '../utils/calculations';
import {
  TrendingUp,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ForecastPage() {
  const {
    transactions,
    startingBalance,
    loadPersona,
  } = useMoneyStore();

  const [monthsAhead, setMonthsAhead] = useState<3 | 6>(6);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Compute forecast directly from store
  const forecast = calculateForecast(transactions, monthsAhead, startingBalance);

  // Build combined historical + projected chart data
  const chartData: {
    month: string;
    actual: number | null;
    projected: number | null;
  }[] = [];

  // 1. Past 3 months
  let running = forecast.currentBalance - (forecast.netMonthlyPace * 3);
  for (let m = 3; m >= 1; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    running += forecast.netMonthlyPace;
    chartData.push({
      month: label,
      actual: Math.max(0, running),
      projected: null,
    });
  }

  // 2. Current Month (Bridge point)
  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'short' });
  chartData.push({
    month: currentMonthLabel,
    actual: forecast.currentBalance,
    projected: forecast.currentBalance,
  });

  // 3. Projected Future Months (Dashed Line)
  forecast.points.filter(p => p.isProjected).forEach((p) => {
    const [y, m] = p.month.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    chartData.push({
      month: label,
      actual: null,
      projected: Math.round(p.projectedBalance),
    });
  });

  const hasFewEntries = transactions.length < 4;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tool #4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
            Future Forecast
          </h1>
          <p className="text-sm text-[#5B6785] mt-1">
            A simple look ahead based on your real income and spending over the last 3 months.
          </p>
        </div>

        {/* 3 or 6 Month Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E2E8F7] shadow-2xs">
          <button
            onClick={() => setMonthsAhead(3)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              monthsAhead === 3 ? 'bg-[#0B5CE6] text-white' : 'text-[#5B6785] hover:text-[#1D2839]'
            }`}
          >
            3 Months Ahead
          </button>
          <button
            onClick={() => setMonthsAhead(6)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              monthsAhead === 6 ? 'bg-[#0B5CE6] text-white' : 'text-[#5B6785] hover:text-[#1D2839]'
            }`}
          >
            6 Months Ahead
          </button>
        </div>
      </div>

      {hasFewEntries && (
        <div className="p-4 rounded-xl bg-[#fff9e6] border border-[#f79009] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#1D2839]">
            <Info className="w-4 h-4 text-[#f79009] shrink-0" />
            <span>You have few recorded entries. For richer predictions, explore with sample data.</span>
          </div>
          <button
            onClick={() => loadPersona('shop')}
            className="btn-lime text-xs py-1.5 px-3 shrink-0"
          >
            Load Sample Scenario
          </button>
        </div>
      )}

      {/* ── Plain Sentence Verdict Card ── */}
      <div
        className={`accora-card border p-6 ${
          forecast.netMonthlyPace >= 0
            ? 'bg-[#f3fbd9]/50 border-[#A3D508]'
            : 'bg-[#ffefed]/50 border-[#FD614F]'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F7] flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp
              className={`w-5 h-5 ${
                forecast.netMonthlyPace >= 0 ? 'text-[#0B5CE6]' : 'text-[#FD614F]'
              }`}
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#1D2839] leading-snug">
              {forecast.summarySentence}
            </h2>
            <p className="text-xs text-[#5B6785]">
              Average monthly income: <strong>PKR {forecast.avgMonthlyIncome.toLocaleString()}</strong> • Average spending: <strong>PKR {forecast.avgMonthlyExpense.toLocaleString()}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── Forecast Projection Chart ── */}
      <div className="accora-card bg-white border-[#E2E8F7] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1D2839]">
              Projected Cash Balance
            </h3>
            <p className="text-xs text-[#5B6785]">
              Solid blue line = actual records • Dashed green line = future projection
            </p>
          </div>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="text-xs font-semibold text-[#0B5CE6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How we worked this out</span>
          </button>
        </div>

        {showHowItWorks && (
          <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] text-xs text-[#1D2839] space-y-2 animate-in fade-in duration-150">
            <p className="font-bold text-[#0B5CE6]">How we worked this out:</p>
            <p>
              We take the average income of your last 3 months (PKR {forecast.avgMonthlyIncome.toLocaleString()}) and subtract your average monthly spending (PKR {forecast.avgMonthlyExpense.toLocaleString()}).
            </p>
            <p>
              The difference is added to your cash today (PKR {forecast.currentBalance.toLocaleString()}) month after month. There are no hidden guesses, algorithms, or fake numbers.
            </p>
          </div>
        )}

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F7" />
              <XAxis dataKey="month" stroke="#5B6785" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#5B6785"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `PKR ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Balance']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7', fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => (value === 'actual' ? 'Recorded History' : 'Projected Trajectory')}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0B5CE6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0B5CE6' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#A3D508"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={{ r: 4, fill: '#A3D508' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
