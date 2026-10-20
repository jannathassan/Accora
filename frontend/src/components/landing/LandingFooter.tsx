import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import type { ModalType } from './LandingModal';

interface LandingFooterProps {
  onOpenModal: (type: ModalType) => void;
}

export default function LandingFooter({ onOpenModal }: LandingFooterProps) {
  return (
    <footer className="bg-[#02050e] border-t border-indigo-950/80 text-slate-400 py-16 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-indigo-950/80">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 border border-violet-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-sans">Accora</span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300">
                Copilot
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans">
              Your Business, With Intelligence. Accora transforms financial transactions into 
              forward-looking forecasts, health diagnostics, and prioritized strategic directives.
            </p>

            <div className="pt-2 text-[11px] text-slate-500 font-sans flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Deterministic Analytics Core • AI Financial Copilot
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3 font-sans">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/app" className="hover:text-violet-300 transition-colors">Executive Dashboard</Link>
              </li>
              <li>
                <Link to="/app/transactions" className="hover:text-violet-300 transition-colors">Transaction Ledger</Link>
              </li>
              <li>
                <Link to="/app/invoices" className="hover:text-violet-300 transition-colors">Invoicing & Receivables</Link>
              </li>
              <li>
                <Link to="/app/reports" className="hover:text-violet-300 transition-colors">Financial Reports</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Intelligence */}
          <div className="space-y-3 font-sans">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Intelligence</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/app/intelligence" className="hover:text-violet-300 transition-colors">AI Copilot Insights</Link>
              </li>
              <li>
                <Link to="/app/forecast" className="hover:text-violet-300 transition-colors">Cash Flow Forecast</Link>
              </li>
              <li>
                <Link to="/app/scenarios" className="hover:text-violet-300 transition-colors">What-If Scenarios</Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-violet-300 transition-colors">Health Diagnostics</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-3 font-sans">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenModal('about')}
                  className="hover:text-violet-300 transition-colors cursor-pointer text-left"
                >
                  About Accora
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="hover:text-violet-300 transition-colors cursor-pointer text-left"
                >
                  Security & Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="hover:text-violet-300 transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('contact')}
                  className="hover:text-violet-300 transition-colors cursor-pointer text-left"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-sans">
          <p>© 2026 Accora Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for growing businesses</span>
            <span>•</span>
            <span>Deterministic financial intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
