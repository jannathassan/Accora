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

  const chartGrid = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#cccccc' : '#e4e7ec';
  const chartText = theme === 'dark' ? '#8892a6' : theme === 'high-contrast' ? '#333333' : '#667085';
  const tooltipBg = theme === 'dark' ? '#1a1e28' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#000000' : '#e4e7ec';

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ai-light flex items-center justify-center">
            <Brain className="w-4 h-4 text-ai" />
          </div>
          <h2 className="text-sm font-semibold text-surface-900">Future Forecast</h2>
          <span className="text-[10px] text-surface-400 ml-2 bg-surface-100 px-2 py-0.5 rounded">
            Estimates based on historical trends
          </span>
        </div>
        <Link to="/app/forecast" className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
          Full Forecast <ArrowRight className="w-3 h-3" />
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
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                  <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
                  <Tooltip
                    formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
                  />
                  <Area
                    type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2}
                    fill={`url(#fc-${fc.metric})`} strokeDasharray=""
                  />
                  {/* Predicted portion gets dashed */}
                  <Area
                    type="monotone" dataKey={(d: { predicted: boolean }) => d.predicted ? d.value : undefined}
                    stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-surface-400 mt-1">{fc.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
