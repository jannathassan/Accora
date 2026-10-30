import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, User } from 'lucide-react';
import { BRAND_LOGO, BRAND_MASCOT } from '../assets/brand';
import { useMoneyStore } from '../store/moneyStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setupCustomUser, loadPersona } = useMoneyStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Shop and online-seller owner');
  const [startingBalance, setStartingBalance] = useState('');
  const [loadSample, setLoadSample] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setupCustomUser({
      name: name.trim(),
      role,
      startingBalance: parseFloat(startingBalance) || 0,
      taxRate: 1.5,
      withSampleData: loadSample,
    });

    navigate('/app');
  };

  const handleQuickDemo = () => {
    loadPersona('shop');
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

      {/* Main Signup Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="accora-card bg-white border-[#E2E8F7] max-w-md w-full p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <img src={BRAND_MASCOT} alt="Mascot" className="w-14 h-14 mx-auto object-contain" />
            <h1 className="text-2xl font-extrabold text-[#1D2839]">Create Free Account</h1>
            <p className="text-xs text-[#5B6785] leading-relaxed">
              Start tracking your money in PKR. Your profile runs private and secure in your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1D2839] mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Sara Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#E2E8F7] rounded-xl text-xs text-[#1D2839] focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
                />
                <User className="w-4 h-4 text-[#5B6785] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1D2839] mb-1">
                Who are you? (Select your group)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E2E8F7] rounded-xl text-xs text-[#1D2839] bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
              >
                <option value="Shop and online-seller owner">Shop &amp; Online-seller owner</option>
                <option value="Freelancer and side-hustler">Freelancer &amp; Side-hustler</option>
                <option value="Working professional">Working professional (Salaried)</option>
                <option value="Homemaker">Homemaker (Household &amp; Committees)</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1D2839] mb-1">
                Starting Cash Balance in PKR (Optional)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E2E8F7] rounded-xl text-xs text-[#1D2839] focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
              />
              <p className="text-[10px] text-[#5B6785] mt-1">Cash, bank balance, and Nayapay/JazzCash total.</p>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] cursor-pointer">
              <input
                type="checkbox"
                checked={loadSample}
                onChange={(e) => setLoadSample(e.target.checked)}
                className="w-4 h-4 accent-[#0B5CE6] rounded"
              />
              <span className="text-[11px] text-[#1D2839] font-medium">
                Include sample Pakistani records to explore first
              </span>
            </label>

            <button
              type="submit"
              className="btn-primary w-full text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Option */}
          <div className="pt-2 text-center space-y-2 border-t border-[#E2E8F7]">
            <p className="text-xs text-[#5B6785]">Just want to look around first?</p>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="btn-lime w-full text-xs py-2.5 font-bold cursor-pointer"
            >
              Try the Demo (No Sign-Up)
            </button>
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-[#5B6785]">
            <ShieldCheck className="w-4 h-4 text-[#0B5CE6] shrink-0 mt-0.5" />
            <span>
              Your data is stored privately in your browser. No passwords or bank credentials are ever transmitted to third-party servers.
            </span>
          </div>

          <div className="text-center text-xs text-[#5B6785]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0B5CE6] font-bold hover:underline">
              Log in
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
