import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Lightbulb,
  MessageSquare,
  Shield,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-card">
      {/* ─── Navigation ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-surface-card/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-surface-900 tracking-tight">
              Accora
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
            <a href="#features" className="hover:text-surface-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-surface-900 transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-surface-900 transition-colors">Use Cases</a>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-light text-ai text-xs font-semibold mb-6">
            <Brain className="w-3.5 h-3.5" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-surface-900 tracking-tight leading-tight mb-6">
            Your Business,
            <br />
            <span className="text-brand-600">With Intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Accora transforms raw financial data into understanding, predictions,
            alerts, and recommendations — so you can make smarter decisions
            without a financial analyst.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
            >
              Try the Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors"
            >
              See Features
            </a>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl border border-surface-200 bg-surface-50 p-6 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: 'PKR 1.55M', change: '+3.4%', positive: true },
              { label: 'Expenses', value: 'PKR 1.11M', change: '+4.6%', positive: false },
              { label: 'Net Profit', value: 'PKR 441.5K', change: '-1.2%', positive: false },
              { label: 'Health Score', value: '72/100', change: '+3', positive: true },
            ].map((m) => (
              <div key={m.label} className="bg-surface-card rounded-xl p-4 shadow-sm">
                <p className="text-xs text-surface-500 mb-1">{m.label}</p>
                <p className="text-xl font-semibold text-surface-900">{m.value}</p>
                <span
                  className={`text-xs font-medium ${
                    m.positive ? 'text-positive' : 'text-risk'
                  }`}
                >
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Value Prop ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-surface-50">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Not another accounting dashboard
          </h2>
          <p className="text-surface-500 text-lg">
            Traditional tools <strong>record and report</strong>. Accora{' '}
            <strong>understands, predicts, and recommends</strong>.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { step: 'Understand', desc: 'Analyze revenue, expenses, margins, and trends automatically.', icon: BarChart3 },
            { step: 'Predict', desc: 'Forecast future revenue, expenses, and cash flow.', icon: TrendingUp },
            { step: 'Alert', desc: 'Detect risks, anomalies, and opportunities proactively.', icon: Lightbulb },
            { step: 'Recommend', desc: 'Get specific, data-grounded action items.', icon: Zap },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-surface-card rounded-xl p-6 shadow-sm text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">{s.step}</h3>
              <p className="text-sm text-surface-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Powerful features, simple experience
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Financial Dashboard',
              desc: 'Key metrics, trends, and health at a glance. Clean, information-dense, and uncluttered.',
              icon: BarChart3,
            },
            {
              title: 'AI Financial Copilot',
              desc: 'Ask questions about your business in plain language. Get answers grounded in your actual data.',
              icon: MessageSquare,
            },
            {
              title: 'Proactive Insights',
              desc: 'Risks, anomalies, and opportunities surfaced automatically — before you even ask.',
              icon: Lightbulb,
            },
            {
              title: 'Forecasting',
              desc: 'See where your business is heading with AI-powered revenue and cash-flow projections.',
              icon: Brain,
            },
            {
              title: 'What-If Scenarios',
              desc: 'Model decisions before making them. "What if revenue drops 20%?" — see the impact instantly.',
              icon: Sliders,
            },
            {
              title: 'Business Health Score',
              desc: 'A single, explainable score that tells you exactly how your business is doing and why.',
              icon: TrendingUp,
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-surface-card rounded-xl border border-surface-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">{f.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-surface-900 text-white">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">How Accora works</h2>
          <p className="text-surface-400 text-lg">
            From raw data to smart decisions in four steps.
          </p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { num: '01', label: 'Connect', desc: 'Import or enter your financial data.' },
            { num: '02', label: 'Analyze', desc: 'AI understands your business patterns.' },
            { num: '03', label: 'Insight', desc: 'Risks and opportunities surface automatically.' },
            { num: '04', label: 'Act', desc: 'Follow data-driven recommendations.' },
          ].map((s) => (
            <div key={s.num}>
              <div className="text-brand-400 text-sm font-mono mb-2">{s.num}</div>
              <h3 className="font-semibold text-lg mb-1">{s.label}</h3>
              <p className="text-sm text-surface-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Use Cases ──────────────────────────────────────────── */}
      <section id="use-cases" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Built for people who run real businesses
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Small Business Owners',
              desc: 'Understand your finances without hiring an analyst. Get clear answers about performance and next steps.',
            },
            {
              title: 'Freelancers',
              desc: 'Track irregular income, manage expenses, plan taxes, and forecast cash flow with confidence.',
            },
            {
              title: 'Solo Entrepreneurs',
              desc: 'Quick answers about business performance. Know what to focus on next, backed by your data.',
            },
          ].map((u) => (
            <div
              key={u.title}
              className="bg-surface-50 rounded-xl p-6 border border-surface-200"
            >
              <h3 className="font-semibold text-surface-900 mb-2">{u.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-surface-50">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
          <Shield className="w-12 h-12 text-surface-300 shrink-0" />
          <div>
            <h3 className="font-semibold text-surface-900 mb-1">
              Your data stays yours
            </h3>
            <p className="text-sm text-surface-500">
              Accora processes your financial data securely. AI credentials never reach the browser.
              Your data is encrypted and never shared with third parties.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Ready to understand your business?
          </h2>
          <p className="text-surface-500 mb-8">
            See Accora in action with realistic demo data.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
          >
            Launch Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-surface-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-700">Accora</span>
          </div>
          <p className="text-xs text-surface-400">
            Your Business, With Intelligence. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
