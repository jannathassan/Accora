import { useState } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { BRAND_MASCOT } from '../assets/brand';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingWizardModal({ isOpen, onClose }: OnboardingWizardModalProps) {
  const { setupCustomUser } = useMoneyStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Shop owner']);
  const [helpGoals, setHelpGoals] = useState<string[]>([
    'Track spending',
    'Save money',
    'See the future forecast',
  ]);
  const [startingBalance, setStartingBalance] = useState('50000');
  const [taxStartMonth] = useState('July');
  const [currency] = useState('PKR');
  const [loadSampleData, setLoadSampleData] = useState(true);

  if (!isOpen) return null;

  const whoOptions = [
    { label: 'Shop or online-seller owner', id: 'Shop owner' },
    { label: 'Freelancer or side-hustler', id: 'Freelancer' },
    { label: 'Working professional (salaried)', id: 'Employee' },
    { label: 'Homemaker (household budget)', id: 'Homemaker' },
    { label: 'Student or learner', id: 'Student' },
  ];

  const goalOptions = [
    'Track spending and where cash went',
    'Save money and reach targets',
    'Send invoices and payment reminders',
    'Plan tax set-aside for FBR',
    'Manage committees (BC / kameti)',
    'See the future forecast',
  ];

  const toggleGroup = (grp: string) => {
    setSelectedGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
    );
  };

  const toggleGoal = (goal: string) => {
    setHelpGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = () => {
    setupCustomUser({
      name: name.trim() || 'Friend',
      role: selectedGroups.join(', ') || 'Entrepreneur',
      startingBalance: parseFloat(startingBalance) || 0,
      withSampleData: loadSampleData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#E2E8F7] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#1D2839]">
        
        {/* Header with Mascot */}
        <div className="flex items-center justify-between border-b border-[#E2E8F7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] p-1.5 flex items-center justify-center">
              <img src={BRAND_MASCOT} alt="Mascot" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1D2839]">
                Let&apos;s set you up (30 seconds)
              </h2>
              <p className="text-xs text-[#5B6785]">Step {step} of 3</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#5B6785] hover:text-[#1D2839] px-2 py-1"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Who are you? */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ayesha, Ali, or Usman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
                1. Who are you? (select one or more)
              </label>
              <div className="space-y-2">
                {whoOptions.map((opt) => {
                  const selected = selectedGroups.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleGroup(opt.id)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#e8f0fe] border-[#0B5CE6] text-[#0B5CE6]'
                          : 'bg-[#F4F7FC] border-[#E2E8F7] text-[#1D2839] hover:bg-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selected && <Check className="w-4 h-4 text-[#0B5CE6]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary text-xs py-2 px-5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: What do you want help with? */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
                2. What do you want help with?
              </label>
              <div className="space-y-2">
                {goalOptions.map((goal) => {
                  const selected = helpGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#f3fbd9] border-[#A3D508] text-[#1D2839]'
                          : 'bg-[#F4F7FC] border-[#E2E8F7] text-[#5B6785] hover:bg-white'
                      }`}
                    >
                      <span>{goal}</span>
                      {selected && <Check className="w-4 h-4 text-[#1D2839]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline text-xs py-2 px-4"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary text-xs py-2 px-5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Starting balance & setup */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-1">
                3. Money you have right now (optional, PKR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6]"
              />
              <p className="text-[11px] text-[#5B6785] mt-1">
                Cash in bank, Nayapay/JazzCash, or at home.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F7]">
                <span className="text-[#5B6785] block font-semibold">Currency</span>
                <strong className="text-[#1D2839] text-sm">{currency} (Pakistani Rupee)</strong>
              </div>
              <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F7]">
                <span className="text-[#5B6785] block font-semibold">Tax Year Starts</span>
                <strong className="text-[#1D2839] text-sm">{taxStartMonth} 1st (FBR)</strong>
              </div>
            </div>

            <div className="p-3 bg-[#f3fbd9] border border-[#A3D508] rounded-xl">
              <label className="flex items-center gap-2.5 text-xs text-[#1D2839] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={loadSampleData}
                  onChange={(e) => setLoadSampleData(e.target.checked)}
                  className="rounded accent-[#0B5CE6] w-4 h-4"
                />
                <span>Fill with 12 months of rich sample data so I can explore first</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline text-xs py-2 px-4"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="btn-lime text-xs py-2 px-6 font-bold"
              >
                <span>Start using ACCORA</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
