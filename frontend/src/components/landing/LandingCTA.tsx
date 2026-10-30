import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BRAND_MASCOT } from '../../assets/brand';

interface LandingCTAProps {
  onTryDemo?: () => void;
}

export default function LandingCTA({ onTryDemo }: LandingCTAProps) {
  const handleTryDemo = () => {
    if (onTryDemo) {
      onTryDemo();
    } else {
      const el = document.getElementById('demo-personas');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = '#/app?demo=shop';
      }
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F4F7FC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1D2839] rounded-2xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          
          {/* Friendly Mascot */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/20">
              <img src={BRAND_MASCOT} alt="ACCORA Mascot" className="w-full h-full object-contain" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ready to see where your money goes?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            Try the demo with 12 months of realistic Pakistani sample data. No sign-up required. Free forever to track your money.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleTryDemo}
              className="btn-lime w-full sm:w-auto text-base px-8 cursor-pointer"
            >
              <span>Try the demo (no sign-up)</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <Link
              to="/signup"
              className="btn-outline w-full sm:w-auto text-base text-white border-white/30 hover:bg-white/10 hover:text-white"
            >
              Create free account
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span>✓ Instant browser demo</span>
            <span>✓ Amounts in PKR</span>
            <span>✓ 100% private to your device</span>
          </div>

        </div>
      </div>
    </section>
  );
}
