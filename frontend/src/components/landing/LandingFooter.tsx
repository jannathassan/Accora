import { Link } from 'react-router-dom';
import { BRAND_LOGO, BRAND_MASCOT } from '../../assets/brand';
import { SOCIAL_LINKS } from '../../config/links';
import type { ModalType } from './LandingModal';

interface LandingFooterProps {
  onOpenModal: (type: ModalType) => void;
}

export default function LandingFooter({ onOpenModal }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#E2E8F7] text-[#5B6785] py-12 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E2E8F7]">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img src={BRAND_LOGO} alt="ACCORA" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-xs text-[#5B6785] max-w-sm leading-relaxed">
              ACCORA is an AI money helper that transforms income, spending, and bill records into clear answers, forecasts, and savings peace of mind for people across Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1D2839] font-medium">
              <img src={BRAND_MASCOT} alt="Mascot" className="w-5 h-5 object-contain" />
              <span>Simple, honest financial intelligence in PKR</span>
            </div>
          </div>

          {/* 10 Tools Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D2839] text-xs uppercase tracking-wider">
              10 Simple Tools
            </h4>
            <ul className="space-y-1.5 text-xs text-[#5B6785]">
              <li><Link to="/app" className="hover:text-[#0B5CE6]">My Money Dashboard</Link></li>
              <li><Link to="/app/transactions" className="hover:text-[#0B5CE6]">Income & Spending</Link></li>
              <li><Link to="/app/invoices" className="hover:text-[#0B5CE6]">Bills & Invoices</Link></li>
              <li><Link to="/app/forecast" className="hover:text-[#0B5CE6]">Future Forecast</Link></li>
              <li><Link to="/app/scenarios" className="hover:text-[#0B5CE6]">“Can I Afford It?”</Link></li>
              <li><Link to="/app/ask" className="hover:text-[#0B5CE6]">Ask ACCORA AI</Link></li>
            </ul>
          </div>

          {/* Social Links from ONE config file (Section 4) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D2839] text-xs uppercase tracking-wider">
              Connect & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#5B6785]">
              <li>
                <a
                  href={SOCIAL_LINKS.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B5CE6] transition-colors"
                >
                  Website (accora-theta.vercel.app)
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B5CE6] transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B5CE6] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B5CE6] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="hover:text-[#0B5CE6] cursor-pointer"
                >
                  Privacy & Data Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="hover:text-[#0B5CE6] cursor-pointer"
                >
                  Terms & FBR Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B6785]">
          <p>© {currentYear} ACCORA. Working Prototype for Startup Incubation.</p>
          <p className="text-[11px] text-center sm:text-right">
            All amounts in Pakistani Rupee (PKR). Tax estimates are for planning only.
          </p>
        </div>

      </div>
    </footer>
  );
}
