import { Link } from 'react-router-dom';
import { ArrowRight, Play, Store, Laptop, Briefcase, Home } from 'lucide-react';
import { BRAND_MASCOT } from '../../assets/brand';

interface LandingHeroProps {
  onSelectPersona?: (personaKey: 'shop' | 'free' | 'pro' | 'home') => void;
}

export default function LandingHero({ onSelectPersona }: LandingHeroProps) {

  const handleLaunchPersona = (key: 'shop' | 'free' | 'pro' | 'home') => {
    if (onSelectPersona) {
      onSelectPersona(key);
    } else {
      // Direct navigation with hash param
      window.location.hash = `#/app?demo=${key}`;
    }
  };

  const personas = [
    {
      key: 'shop' as const,
      name: 'Ali, shop owner',
      role: 'Shop & online seller',
      pain: 'Hard to track daily cash sales vs. vendor stock costs and know if the shop is actually profitable.',
      icon: Store,
      badge: 'Shop owner',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      key: 'free' as const,
      name: 'Sara, freelancer',
      role: 'Freelancer & side-hustler',
      pain: 'Client payments come at random dates, and tax season brings scary surprise liabilities.',
      icon: Laptop,
      badge: 'Freelancer',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      key: 'pro' as const,
      name: 'Usman, employee',
      role: 'Working professional',
      pain: 'Salary vanishes within 15 days on groceries and utility bills with zero left over for savings.',
      icon: Briefcase,
      badge: 'Salaried professional',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      key: 'home' as const,
      name: 'Ayesha, homemaker',
      role: 'Household manager',
      pain: 'Balancing kitchen budget, children school fees, and committee (BC) payout turns on paper.',
      icon: Home,
      badge: 'Homemaker',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <section id="hero" className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-[#F4F7FC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          {/* Friendly Mascot Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F7] shadow-sm">
            <img src={BRAND_MASCOT} alt="Mascot" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold text-[#1D2839] tracking-wide">
              Meet ACCORA — Your AI Money Helper
            </span>
          </div>

          {/* Core Pitch Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D2839] tracking-tight leading-[1.15]">
            Where did your money go this month?
          </h1>

          {/* Simple One-line Narrative */}
          <p className="text-base sm:text-xl font-normal text-[#5B6785] leading-relaxed max-w-2xl mx-auto">
            ACCORA is an AI helper that makes money simple to understand, plan, and control — built specifically for people and small businesses in Pakistan.
          </p>

          {/* Dual CTAs (Section 4) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => handleLaunchPersona('shop')}
              className="btn-lime w-full sm:w-auto text-base shadow-sm group cursor-pointer"
            >
              <span>Try the demo (no sign-up)</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/signup"
              className="btn-outline w-full sm:w-auto text-base bg-white shadow-sm"
            >
              Create free account
            </Link>
          </div>

          <p className="text-xs text-[#5B6785]">
            Instant demo with 6–12 months of realistic PKR data. No credit card or install required.
          </p>
        </div>

        {/* Section: "Who it is for" — 4 Personas (Section 4) */}
        <div id="demo-personas" className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1D2839]">
              Who it is for
            </h2>
            <p className="text-sm text-[#5B6785] mt-1">
              Select your profile to explore a personalized 12-month sample scenario:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  className="accora-card flex flex-col justify-between hover:border-[#0B5CE6] hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex items-center justify-center text-[#0B5CE6]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${p.tagColor}`}>
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-[#1D2839] text-base group-hover:text-[#0B5CE6] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#5B6785] font-medium">{p.role}</p>
                    </div>

                    <p className="text-xs text-[#5B6785] leading-relaxed bg-[#F4F7FC] p-2.5 rounded-lg border border-[#E2E8F7]/80">
                      &ldquo;{p.pain}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F7]">
                    <button
                      onClick={() => handleLaunchPersona(p.key)}
                      className="w-full btn-outline text-xs py-2 px-3 justify-center group-hover:bg-[#0B5CE6] group-hover:text-white group-hover:border-[#0B5CE6]"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                      Explore Ali&apos;s demo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
