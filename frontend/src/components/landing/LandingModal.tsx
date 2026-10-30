import { X, ShieldCheck, Mail, FileText } from 'lucide-react';
import { SOCIAL_LINKS } from '../../config/links';
import { BRAND_MASCOT } from '../../assets/brand';

export type ModalType = 'about' | 'privacy' | 'terms' | 'contact' | null;

interface LandingModalProps {
  type: ModalType;
  onClose: () => void;
}

export default function LandingModal({ type, onClose }: LandingModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-[#E2E8F7] p-6 md:p-8 shadow-2xl text-[#1D2839]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-lg text-[#5B6785] hover:text-[#1D2839] hover:bg-[#F4F7FC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#0B5CE6]">
              <img src={BRAND_MASCOT} alt="Mascot" className="w-8 h-8 object-contain" />
              <h3 className="text-xl font-bold text-[#1D2839]">About ACCORA</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#5B6785]">
              ACCORA is an AI money helper built for shop owners, freelancers, salaried professionals, and homemakers across Pakistan. 
              Our pitch is simple: <strong>&ldquo;Where did your money go this month?&rdquo;</strong>
            </p>
            <p className="text-sm leading-relaxed text-[#5B6785]">
              Instead of intimidating accounting spreadsheets with debits, credits, and financial jargon, ACCORA answers your questions in plain everyday words and gives you 10 practical tools to keep your hard-earned money under control.
            </p>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-2 mt-4 text-xs text-[#5B6785]">
              <div className="font-bold text-[#1D2839] uppercase tracking-wider text-[11px]">
                Built for Pakistan
              </div>
              <p>• All numbers in Pakistani Rupee (PKR)</p>
              <p>• Household committees (kameti / BC) tracking</p>
              <p>• FBR tax year planning from July to June</p>
              <p>• Freelancer foreign remittance bank tracking</p>
            </div>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#0B5CE6]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1D2839]">Your Data & Privacy</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#5B6785]">
              We believe in honest, straightforward data handling.
            </p>
            <div className="space-y-3 text-xs leading-relaxed text-[#5B6785]">
              <div className="p-3 rounded-lg bg-[#F4F7FC] border border-[#E2E8F7]">
                <strong className="text-[#1D2839] block mb-1">1. Local Storage on Your Device</strong>
                In this prototype demo, all your financial entries, budgets, and invoices remain on your device in your web browser. You can clear them anytime by resetting the demo or clearing browser data.
              </div>
              <div className="p-3 rounded-lg bg-[#F4F7FC] border border-[#E2E8F7]">
                <strong className="text-[#1D2839] block mb-1">2. No Ad Retargeting or Data Selling</strong>
                We will never sell your financial records to data brokers, lenders, or advertisers.
              </div>
              <div className="p-3 rounded-lg bg-[#F4F7FC] border border-[#E2E8F7]">
                <strong className="text-[#1D2839] block mb-1">3. Deterministic Numbers</strong>
                All health scores, forecasts, and savings recommendations come from verified pure mathematical formulas, never invented by AI.
              </div>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#0B5CE6]">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1D2839]">Terms & Disclaimer</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#5B6785]">
              Please note the following important points when using ACCORA:
            </p>
            <div className="space-y-3 text-xs leading-relaxed text-[#5B6785]">
              <div className="p-3 rounded-lg bg-[#ffefed] border border-[#ffd4cf] text-[#1D2839]">
                <strong className="text-[#FD614F] block mb-1">⚠️ Not Legal or Financial Advice</strong>
                ACCORA provides informational tools, estimates, and budgeting assistance. Tax rules and FBR rates change periodically; always consult a licensed tax advisor or the Federal Board of Revenue before filing tax returns.
              </div>
              <div className="p-3 rounded-lg bg-[#F4F7FC] border border-[#E2E8F7]">
                <strong className="text-[#1D2839] block mb-1">Committee (BC) Tracker Notice</strong>
                The Committee tool is a record-keeping tracker only. ACCORA does not hold, collect, process, or disburse money or escrow for committees.
              </div>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#0B5CE6]">
              <Mail className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1D2839]">Contact the ACCORA Team</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#5B6785]">
              We would love to hear feedback from startup judges, mentors, and test users.
            </p>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-2 text-xs text-[#5B6785]">
              <p><strong>Email:</strong> {SOCIAL_LINKS.supportEmail}</p>
              <p><strong>Prototype URL:</strong> {SOCIAL_LINKS.website}</p>
              <p><strong>Incubation Presentation:</strong> ACCORA Pitch 2026</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E2E8F7] text-right">
          <button
            onClick={onClose}
            className="btn-outline text-xs py-2 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
