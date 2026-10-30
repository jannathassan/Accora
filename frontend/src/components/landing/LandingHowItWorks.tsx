import { PlusCircle, BarChart3, HelpCircle } from 'lucide-react';

export default function LandingHowItWorks() {
  const steps = [
    {
      num: '1',
      title: '1. Add your money',
      desc: 'Type in daily sales or spending, repeat monthly bills, or upload a bank or wallet statement CSV in seconds.',
      icon: PlusCircle,
      detail: 'Auto-categorization maps your groceries, fuel, stock, and bills.',
    },
    {
      num: '2',
      title: '2. See the picture',
      desc: 'Your dashboard, future forecast, health score, and alerts update instantly together from one single shared record.',
      icon: BarChart3,
      detail: 'Clear bar charts show money coming in vs. going out over 6 months.',
    },
    {
      num: '3',
      title: '3. Get clear answers',
      desc: 'Ask in plain everyday words: “Can I afford this?” or “How much can I save?” Get honest numbers based strictly on your records.',
      icon: HelpCircle,
      detail: 'Zero financial jargon. Tested against your real cash runway.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#F4F7FC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E8F7] text-[#1D2839] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span>Simple 3-Step Flow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1D2839] tracking-tight">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-[#5B6785]">
            You don’t need an accountant or complicated bookkeeping software. Just 3 simple steps:
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="accora-card flex flex-col justify-between border-[#E2E8F7] bg-white relative overflow-hidden group hover:border-[#0B5CE6]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#0B5CE6] flex items-center justify-center font-bold text-lg border border-[#0B5CE6]/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-[#E2E8F7] group-hover:text-[#0B5CE6]/20 transition-colors">
                      0{s.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1D2839]">
                      {s.title}
                    </h3>
                    <p className="text-sm text-[#5B6785] mt-2 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E2E8F7] text-xs text-[#1D2839] font-medium bg-[#F4F7FC] -mx-5 -mb-5 p-3 px-5">
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
