import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, User } from 'lucide-react';
import { BRAND_LOGO, BRAND_MASCOT } from '../assets/brand';
import { useMoneyStore } from '../store/moneyStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loadPersona, userName } = useMoneyStore();
  const [name, setName] = useState(userName || '');

  const handleSignInLocal = (e: FormEvent) => {
    e.preventDefault();
    // Navigate straight to app with saved records
    navigate('/app');
  };

  const handleDemoSignIn = (persona: 'shop' | 'free' | 'pro' | 'home') => {
    loadPersona(persona);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#1D2839] font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-4 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={BRAND_LOGO} alt="ACCORA" className="h-8 w-auto object-contain" />
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-[#5B6785] hover:text-[#0B5CE6]"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="accora-card bg-white border-[#E2E8F7] max-w-md w-full p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <img src={BRAND_MASCOT} alt="Mascot" className="w-14 h-14 mx-auto object-contain" />
            <h1 className="text-2xl font-extrabold text-[#1D2839]">Welcome Back</h1>
            <p className="text-xs text-[#5B6785] leading-relaxed">
              ACCORA runs local-first in your browser for instant, private evaluation. No cloud bank passwords or subscriptions required.
            </p>
          </div>

          {/* Quick Demo Access (Recommended) */}
          <div className="p-4 rounded-xl bg-[#f3fbd9] border border-[#A3D508] space-y-2.5">
            <span className="text-xs font-bold text-[#1D2839] block">
              Quick Incubation / Judge Demo (Recommended)
            </span>
            <p className="text-[11px] text-[#1D2839]/80">
              Load 12 months of realistic Pakistani PKR records immediately:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSignIn('shop')}
                className="btn-lime text-[11px] py-2 px-3 font-bold cursor-pointer"
              >
                Ali (Shop Owner)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('free')}
                className="btn-outline text-[11px] py-2 px-3 bg-white font-bold cursor-pointer"
              >
                Sara (Freelancer)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('pro')}
                className="btn-outline text-[11px] py-2 px-3 bg-white font-bold cursor-pointer"
              >
                Usman (Employee)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('home')}
                className="btn-outline text-[11px] py-2 px-3 bg-white font-bold cursor-pointer"
              >
                Ayesha (Homemaker)
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E2E8F7]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-[#5B6785] uppercase tracking-wider font-bold">
              or continue with your profile
            </span>
            <div className="flex-grow border-t border-[#E2E8F7]"></div>
          </div>

          {/* Local Profile Sign In */}
          <form onSubmit={handleSignInLocal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D2839] mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Ali Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#E2E8F7] rounded-xl text-xs text-[#1D2839] focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
                />
                <User className="w-4 h-4 text-[#5B6785] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open My Local Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Honest Storage Notice */}
          <div className="flex items-start gap-2 pt-2 text-[11px] text-[#5B6785]">
            <ShieldCheck className="w-4 h-4 text-[#0B5CE6] shrink-0 mt-0.5" />
            <span>
              Your data stays private on this computer. You can export or delete your records at any time from Settings.
            </span>
          </div>

          <div className="text-center pt-1 text-xs text-[#5B6785]">
            Need a fresh setup?{' '}
            <Link to="/signup" className="text-[#0B5CE6] font-bold hover:underline">
              Create free account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5B6785]">
        © 2026 ACCORA — Simple AI money helper for Pakistan. All amounts in PKR.
      </footer>
    </div>
  );
}
