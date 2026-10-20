import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import type { ModalType } from './LandingModal';

interface LandingNavbarProps {
  onOpenModal: (type: ModalType) => void;
}

export default function LandingNavbar({ onOpenModal }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#030712]/92 backdrop-blur-xl border-b border-indigo-950/80 shadow-2xl shadow-black/80 py-3.5'
          : 'bg-transparent border-b border-white/[0.06] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 border border-violet-400/40 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.25)] group-hover:border-violet-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-violet-300 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Accora
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 font-mono">
              Copilot
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300 font-sans">
          <button
            onClick={() => scrollTo('features')}
            className="hover:text-violet-300 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hover:text-violet-300 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('preview')}
            className="hover:text-violet-300 transition-colors cursor-pointer"
          >
            Product Preview
          </button>
          <button
            onClick={() => scrollTo('security')}
            className="hover:text-violet-300 transition-colors cursor-pointer"
          >
            Security
          </button>
          <button
            onClick={() => onOpenModal('about')}
            className="hover:text-violet-300 transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3 font-sans">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-violet-200 bg-violet-950/40 border border-violet-400/30 hover:bg-violet-900/40 hover:border-violet-300 shadow-sm transition-all active:scale-[0.98]"
          >
            Sign Up
          </Link>
          <Link
            to="/app"
            className="relative inline-flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all active:scale-[0.98]"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/signup"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-violet-200 bg-violet-950/50 border border-violet-400/30"
          >
            Sign Up
          </Link>
          <Link
            to="/app"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            App
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#030712]/98 border-b border-indigo-950/80 px-6 py-6 space-y-4 shadow-2xl backdrop-blur-2xl animate-fadeIn">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300 font-sans">
            <button
              onClick={() => scrollTo('features')}
              className="text-left py-2 hover:text-violet-300 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-left py-2 hover:text-violet-300 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('preview')}
              className="text-left py-2 hover:text-violet-300 transition-colors"
            >
              Product Preview
            </button>
            <button
              onClick={() => scrollTo('security')}
              className="text-left py-2 hover:text-violet-300 transition-colors"
            >
              Security
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenModal('about');
              }}
              className="text-left py-2 hover:text-violet-300 transition-colors"
            >
              About
            </button>
          </nav>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5 font-sans">
            <Link
              to="/login"
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="w-full py-2.5 text-center text-xs font-bold text-violet-200 bg-violet-950/50 border border-violet-400/40 rounded-xl"
            >
              Sign Up
            </Link>
            <Link
              to="/app"
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-md"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
