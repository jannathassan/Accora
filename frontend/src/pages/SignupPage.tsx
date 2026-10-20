import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Info,
} from 'lucide-react';
import LandingModal, { type ModalType } from '../components/landing/LandingModal';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  registerUser,
} from '../services/auth';

export default function SignupPage() {
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendOfflineNotice, setBackendOfflineNotice] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field Touched / Validation Tracking
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const nameError = touched.fullName ? validateFullName(fullName) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordRules = validatePassword(password);
  const confirmPasswordError =
    touched.confirmPassword && password !== confirmPassword
      ? 'Passwords do not match.'
      : null;

  const isFormValid =
    !validateFullName(fullName) &&
    !validateEmail(email) &&
    passwordRules.score >= 3 &&
    password === confirmPassword &&
    agreeTerms;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setErrorMessage(null);
    setBackendOfflineNotice(null);
    setSuccessMessage(null);

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    if (nameErr || emailErr) {
      setErrorMessage(nameErr || emailErr);
      return;
    }

    if (passwordRules.score < 3) {
      setErrorMessage('Please create a stronger password meeting the requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must review and agree to the Terms of Use and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        name: fullName,
        email,
        password,
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Initializing your financial workspace...');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else if (result.isBackendOffline) {
        setBackendOfflineNotice(
          'Backend Authentication Service (/api/v1/auth/signup) is not yet active on the server. Your account details have been validated, but accounts cannot be saved to the database until backend persistence is enabled.'
        );
      } else {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected registration error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = (score: number) => {
    if (score <= 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-purple-400';
    return 'bg-emerald-400';
  };

  const getStrengthLabel = (score: number) => {
    if (!password) return 'Enter password';
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 font-sans antialiased relative overflow-hidden flex flex-col justify-between">
      {/* Background galaxy space glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-950/40 via-purple-950/25 to-transparent blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-900/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-30" />

      {/* Top Header / Brand */}
      <header className="relative z-10 px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c293b] to-[#101827] border border-white/10 p-[1px] shadow-sm group-hover:border-purple-400 transition-all">
            <div className="w-full h-full bg-[#060919] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">Accora</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
            Copilot
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-slate-200 bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all font-semibold"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="rounded-2xl bg-[#060919]/90 border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Enterprise Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Unlock real-time financial intelligence and predictive forecasts.
              </p>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Backend Offline Architecture Notice */}
            {backendOfflineNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
                <div className="flex items-start gap-2 text-amber-300 font-semibold">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Backend Auth Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {backendOfflineNotice}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 underline"
                  >
                    <span>Launch Live Demo App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                    placeholder="e.g. Ayesha Khan"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#030712] border text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                      nameError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-800 focus:border-purple-400 focus:ring-purple-500/20'
                    }`}
                  />
                </div>
                {nameError && (
                  <p className="text-[11px] text-rose-400 pl-1">{nameError}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    placeholder="name@company.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#030712] border text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-800 focus:border-purple-400 focus:ring-purple-500/20'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-400 pl-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Create Password
                  </label>
                  {password && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Strength: <span className="text-purple-300">{getStrengthLabel(passwordRules.score)}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030712] border border-slate-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="pt-1 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all ${
                            step < passwordRules.score
                              ? getStrengthBarColor(passwordRules.score)
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400 pt-1">
                      <span className={`flex items-center gap-1 ${passwordRules.hasMinLength ? 'text-emerald-400' : ''}`}>
                        <CheckCircle2 className={`w-3 h-3 ${passwordRules.hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                        8+ characters
                      </span>
                      <span className={`flex items-center gap-1 ${passwordRules.hasUpper ? 'text-emerald-400' : ''}`}>
                        <CheckCircle2 className={`w-3 h-3 ${passwordRules.hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
                        Uppercase letter
                      </span>
                      <span className={`flex items-center gap-1 ${passwordRules.hasNumber ? 'text-emerald-400' : ''}`}>
                        <CheckCircle2 className={`w-3 h-3 ${passwordRules.hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                        Number digit
                      </span>
                      <span className={`flex items-center gap-1 ${passwordRules.hasSpecial ? 'text-emerald-400' : ''}`}>
                        <CheckCircle2 className={`w-3 h-3 ${passwordRules.hasSpecial ? 'text-emerald-400' : 'text-slate-600'}`} />
                        Special symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030712] border text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                      confirmPasswordError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-800 focus:border-purple-400 focus:ring-purple-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[11px] text-rose-400 pl-1">{confirmPasswordError}</p>
                )}
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 accent-purple-500 text-purple-500 focus:ring-purple-500/40"
                  />
                  <span className="leading-snug">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setModalType('terms')}
                      className="text-purple-300 hover:text-purple-200 underline font-medium cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setModalType('privacy')}
                      className="text-purple-300 hover:text-purple-200 underline font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-600 hover:to-indigo-600 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Alternate Login Link */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-purple-300 hover:text-purple-200 underline">
                Log In
              </Link>
            </div>

            {/* Direct App Launch Fallback */}
            <div className="mt-3 text-center">
              <Link
                to="/app"
                className="text-[11px] text-slate-500 hover:text-purple-300 transition-colors"
              >
                Or launch demo workspace without signing up &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <p>&copy; {new Date().getFullYear()} Accora Financial Technologies. Bank-grade 256-bit encryption.</p>
      </footer>

      {/* Modals for Terms & Privacy */}
      <LandingModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
