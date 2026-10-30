import { Link } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import { useTheme } from '../store/ThemeProvider';
import { fmtCurrency, periodLabel } from '../utils/format';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Brain, ArrowRight } from 'lucide-react';

export default function ForecastSection() {
  const { forecast, business } = useFinancial();
  const currency = business?.currency ?? 'PKR';
  const { theme } = useTheme();
  if (!forecast.length) return null;

  const chartGrid = theme === 'dark' ? '#28213b' : theme === 'high-contrast' ? '#cccccc' : '#e8e2f2';
  const chartText = theme === 'dark' ? '#9687b8' : theme === 'high-contrast' ? '#333333' : '#736484';
  const tooltipBg = theme === 'dark' ? '#1d182e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#3b3156' : theme === 'high-contrast' ? '#000000' : '#e8e2f2';
  const strokeColor = '#7c3aed';

  return (
    <div className="relative overflow-hidden bg-surface-card rounded-[var(--radius-card)] border border-surface-200 dark:border-surface-200/50 shadow-[var(--shadow-card)] p-6 transition-all hover:border-brand-400/40 font-sans group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-600 via-brand-400 to-transparent opacity-60" />
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-surface-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-100 border border-brand-200 text-brand-600 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
            Predictive Financial Forecast
          </h2>
          <span className="hidden sm:inline-block text-[10px] text-brand-600 dark:text-brand-300 bg-brand-100 dark:bg-brand-500/20 border border-brand-200 dark:border-brand-500/30 px-2 py-0.5 rounded font-mono">
            Model Estimates
          </span>
        </div>
        <Link to="/app/forecast" className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 inline-flex items-center gap-1 transition-colors">
          <span>Full Projections</span> <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {forecast.slice(0, 4).map((fc) => {
          const data = fc.points.map((p) => ({
            period: periodLabel(p.date),
            value: p.value,
            predicted: p.is_predicted,
            low: p.confidence_low,
            high: p.confidence_high,
          }));
          const label = fc.metric.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div key={fc.metric}>
              <h3 className="text-xs font-medium text-surface-600 mb-2">{label}</h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`fc-${fc.metric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                  <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
                  <Tooltip
                    formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
                  />
                  <Area
                    type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2}
                    fill={`url(#fc-${fc.metric})`} strokeDasharray=""
                  />
                  {/* Predicted portion gets dashed */}
                  <Area
                    type="monotone" dataKey={(d: { predicted: boolean; value: number }) => d.predicted ? d.value : undefined}
                    stroke={strokeColor} strokeWidth={2} strokeDasharray="5 3" fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-surface-500 mt-1 font-sans">{fc.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
