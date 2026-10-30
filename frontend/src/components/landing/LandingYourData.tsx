import { ShieldCheck, HardDrive, AlertTriangle, EyeOff } from 'lucide-react';

export default function LandingYourData() {
  const points = [
    {
      icon: HardDrive,
      title: 'Stored locally in your browser',
      desc: 'In this prototype demo, your records are saved directly in your web browser (Local Storage). Nothing is shared with advertisers or third parties.',
    },
    {
      icon: AlertTriangle,
      title: 'Informational estimates, not legal advice',
      desc: 'Tax set-aside figures, forecasts, and affordability verdicts are mathematical estimates to assist planning. Tax rates and laws change, so always confirm with FBR or a qualified tax advisor.',
    },
    {
      icon: EyeOff,
      title: 'Zero data selling or hidden tracking',
      desc: 'We do not sell your personal financial records or track your off-site browsing. You retain full control to export (CSV) or delete your records anytime.',
    },
    {
      icon: ShieldCheck,
      title: 'Calculated directly from your numbers',
      desc: 'Health scores, runway months, and chat responses come from deterministic formulas applied directly to your entries. No made-up or hallucinated figures.',
    },
  ];

  return (
    <section id="your-data" className="py-16 sm:py-20 bg-white border-t border-[#E2E8F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3fbd9] text-[#1D2839] text-xs font-bold uppercase tracking-wider border border-[#A3D508]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D2839]" />
            <span>Honest Privacy & Security</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839] tracking-tight">
            Your data
          </h2>
          <p className="text-sm sm:text-base text-[#5B6785]">
            We believe in complete transparency. Here is exactly how your data is handled:
          </p>
        </div>

        {/* 4 Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="accora-card flex items-start gap-4 border-[#E2E8F7] bg-[#F4F7FC]/60"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F7] flex items-center justify-center text-[#0B5CE6] shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1D2839] text-base">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6785] mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
