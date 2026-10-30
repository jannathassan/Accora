import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingYourData from '../components/landing/LandingYourData';
import LandingCTA from '../components/landing/LandingCTA';
import LandingFooter from '../components/landing/LandingFooter';
import LandingModal, { type ModalType } from '../components/landing/LandingModal';

export default function LandingPage() {
  const [modalType, setModalType] = useState<ModalType>(null);

  const handleSelectPersona = (personaKey: string) => {
    // Navigates to app with demo persona selected
    window.location.hash = `#/app?demo=${personaKey}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#1D2839] font-sans antialiased overflow-x-hidden relative">
      {/* 1. Navbar: Home, Tools, How it works, Try demo, Log in, Sign up */}
      <LandingNavbar
        onOpenModal={setModalType}
        onSelectPersona={handleSelectPersona}
      />

      {/* Main Content Sections */}
      <main>
        {/* 2. Hero: "Where did your money go this month?" + "Who it is for" (4 cards) */}
        <LandingHero onSelectPersona={handleSelectPersona} />

        {/* 3. "10 simple tools in one app" */}
        <LandingFeatures />

        {/* 4. "How it works": 3 steps */}
        <LandingHowItWorks />

        {/* 5. Honest "Your data" privacy section */}
        <LandingYourData />

        {/* 6. Friendly Call to Action */}
        <LandingCTA onTryDemo={() => handleSelectPersona('shop')} />
      </main>

      {/* 7. Footer: config/links placeholders */}
      <LandingFooter onOpenModal={setModalType} />

      {/* Interactive Modal for About, Privacy, Terms, and Contact */}
      <LandingModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
