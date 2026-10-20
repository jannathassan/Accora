import {
  ShieldCheck,
  KeyRound,
  FileLock2,
  Database,
  EyeOff,
} from 'lucide-react';

export default function LandingSecurity() {
  const pillars = [
    {
      icon: EyeOff,
      title: 'Zero Model Training on Your Data',
      description:
        'Your transaction history, invoice amounts, client identities, and profit margins are never used to train, retrain, or fine-tune public foundation AI models.',
    },
    {
      icon: KeyRound,
      title: 'Server-Side Credential Isolation',
      description:
        'AI provider keys and backend secrets remain exclusively in server environment variables. Zero credentials, tokens, or private keys are ever dispatched to browser runtimes.',
    },
    {
      icon: Database,
      title: 'Private Ledger Ownership & Custody',
      description:
        'Accora is architected for isolated multi-tenant vaults. User databases and financial records are strictly isolated; one organization cannot access another organization’s data.',
    },
    {
      icon: FileLock2,
      title: 'Deterministic Grounding',
      description:
        'Every AI recommendation is bounded by verified mathematical calculations from the analytics engine, eliminating generative hallucinations from strategic choices.',
    },
  ];

  return (
    <section id="security" className="py-24 bg-[#030712] relative border-t border-indigo-950/80 overflow-hidden">
      {/* Background ambient galaxy lighting */}
      <div className="absolute top-1/2 right-1/4 w-[650px] h-[450px] bg-violet-900/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-25" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Enterprise-Grade Security & Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Security & Financial Privacy by Design
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Financial intelligence demands uncompromising discretion. Accora enforces 
            strict boundaries between your company books, client browsers, and external AI providers.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto font-sans">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#080d24]/90 border border-violet-500/20 hover:border-violet-400/40 hover:bg-[#0b1230] transition-all shadow-xl shadow-black/40 flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-violet-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-violet-200 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Architecture Statement */}
        <div className="mt-14 max-w-2xl mx-auto p-5 rounded-xl bg-violet-950/30 border border-violet-500/20 text-center font-sans">
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-violet-200">Zero Trust Client Model:</strong> Session tokens expire automatically, API queries are scoped strictly to the authenticated tenant, and raw database paths remain unexposed to browser workers.
          </p>
        </div>
      </div>
    </section>
  );
}
