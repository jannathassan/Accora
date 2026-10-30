import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_LOGO } from '../../assets/brand';
import { Menu, X } from 'lucide-react';
import type { ModalType } from './LandingModal';

interface LandingNavbarProps {
  onOpenModal?: (type: ModalType) => void;
  onSelectPersona?: (personaKey: string) => void;
}

export default function LandingNavbar(_props: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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

  const handleTryDemo = () => {
    setMobileMenuOpen(false);
    scrollTo('demo-personas');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E2E8F7] shadow-sm py-3'
          : 'bg-[#F4F7FC]/90 backdrop-blur-sm border-b border-[#E2E8F7]/60 py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={BRAND_LOGO}
            alt="ACCORA Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links (Section 4: Home, Tools, How it works, Try demo, Log in, Sign up) */}
        <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#1D2839]">
          <button
            onClick={() => scrollTo('hero')}
            className="hover:text-[#0B5CE6] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('tools')}
            className="hover:text-[#0B5CE6] transition-colors cursor-pointer"
          >
            Tools
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hover:text-[#0B5CE6] transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={handleTryDemo}
            className="hover:text-[#0B5CE6] font-semibold text-[#0B5CE6] transition-colors cursor-pointer"
          >
            Try demo
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-[15px] font-semibold text-[#1D2839] hover:text-[#0B5CE6] px-3 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="btn-primary text-sm py-2 px-4 shadow-sm"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#1D2839] hover:text-[#0B5CE6] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F7] px-6 py-5 shadow-lg space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-3 font-medium text-[#1D2839]">
            <button
              onClick={() => scrollTo('hero')}
              className="text-left py-2 hover:text-[#0B5CE6]"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('tools')}
              className="text-left py-2 hover:text-[#0B5CE6]"
            >
              Tools
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-left py-2 hover:text-[#0B5CE6]"
            >
              How it works
            </button>
            <button
              onClick={handleTryDemo}
              className="text-left py-2 font-semibold text-[#0B5CE6]"
            >
              Try demo
            </button>
          </div>
          <div className="pt-3 border-t border-[#E2E8F7] flex flex-col gap-2.5">
            <Link
              to="/login"
              className="btn-outline w-full text-center"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary w-full text-center"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
