import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingProductPreview from '../components/landing/LandingProductPreview';
import LandingSecurity from '../components/landing/LandingSecurity';
import LandingCTA from '../components/landing/LandingCTA';
import LandingFooter from '../components/landing/LandingFooter';
import LandingModal, { type ModalType } from '../components/landing/LandingModal';

export default function LandingPage() {
  const [modalType, setModalType] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-violet-500/30 selection:text-violet-200 font-sans antialiased overflow-x-hidden relative">
      {/* Navigation */}
      <LandingNavbar onOpenModal={setModalType} />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section with Live Dashboard Mockup Preview */}
        <LandingHero />

        {/* 2. Seven Core Product Capabilities */}
        <LandingFeatures />

        {/* 3. How It Works (Methodology) */}
        <LandingHowItWorks />

        {/* 4. Interactive Product Sandbox (AI Copilot, Health Score, Next Move, What-If) */}
        <LandingProductPreview />

        {/* 5. Security & Privacy Architecture */}
        <LandingSecurity />

        {/* 6. High-Impact Call to Action Banner */}
        <LandingCTA />
      </main>

      {/* Footer */}
      <LandingFooter onOpenModal={setModalType} />

      {/* Interactive Modal for About, Privacy, Terms, and Contact */}
      <LandingModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
