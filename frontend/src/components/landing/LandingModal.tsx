import { X, ShieldCheck, Mail, FileText, Info } from 'lucide-react';

export type ModalType = 'about' | 'privacy' | 'terms' | 'contact' | null;

interface LandingModalProps {
  type: ModalType;
  onClose: () => void;
}

export default function LandingModal({ type, onClose }: LandingModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0c1222] border border-slate-700/60 p-6 md:p-8 shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-cyan-400 mb-2">
              <Info className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white tracking-tight">About Accora</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Accora was created to bridge the critical gap between traditional backward-looking accounting 
              and forward-looking business strategy. For small businesses, creative studios, agencies, and 
              solo entrepreneurs, hiring a full-time financial analyst or fractional CFO is often cost-prohibitive.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              Accora transforms raw transaction records and billing receipts into real-time health scores, 
              probabilistic cash-flow forecasts, and proactive strategic recommendations.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Core Guiding Principles</h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Empirical Grounding:</strong> Every AI insight is backed by verified transaction and ledger math.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Proactive Intelligence:</strong> We alert you to margin compression and overdue risks before they harm your runway.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Privacy First:</strong> Your company ledger belongs exclusively to you.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-teal-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white tracking-tight">Privacy & Data Governance</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              We take the privacy of your financial operations seriously. Financial records represent the lifeblood 
              of any business, and Accora is built with strict isolation boundaries.
            </p>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-white block mb-1">1. Zero Model Training on Financial Records</strong>
                Your transactions, customer names, billing amounts, and balance sheets are never used to train, retrain, 
                or fine-tune public foundation AI models.
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-white block mb-1">2. Credential Security</strong>
                All AI model API keys and infrastructure secrets reside on the server-side environment and are never 
                transmitted to client web sessions or stored in browser storage.
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-white block mb-1">3. Demo Mode Isolation</strong>
                In development and demonstration mode, Accora runs against completely synthetic ledger data 
                generated locally, ensuring zero exposure of sensitive corporate information.
              </div>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white tracking-tight">Terms of Use & Disclaimer</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Please review these operational terms regarding the use of the Accora financial platform.
            </p>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-white block mb-1">Financial Intelligence, Not Certified Tax Advice</strong>
                Accora provides automated financial analysis, predictive modeling, and strategic suggestions. 
                It is an informational decision-support tool and does not constitute certified legal, tax, or formal accounting advice. 
                Important capital allocations should be validated with qualified professionals.
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-white block mb-1">Predictive Simulations</strong>
                Forecasting and What-If simulations are statistical estimations based on historical trend data. 
                External market changes, client defaults, or unanticipated business events can affect actual outcomes.
              </div>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-cyan-400 mb-2">
              <Mail className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white tracking-tight">Connect with the Accora Team</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Have questions about Accora, want to explore custom integrations for your business, or have feedback 
              on our AI financial engine? We would love to hear from you.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="text-white font-medium">Accora Financial Copilot</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Technical Inquiries:</span>
                <span className="text-cyan-400 font-mono text-xs">support@accora.internal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Platform Status:</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active / Demo Available
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
