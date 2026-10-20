import { getCurrentYear } from '../utils/date';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Info,
  CheckCircle2,
  KeyRound,
  X,
} from 'lucide-react';
import {
  validateEmail,
  loginUser,
  demoLogin,
} from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('expired=1')) {
      return 'Your session has expired. Please sign in again.';
    }
    return null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [backendOfflineNotice, setBackendOfflineNotice] = useState<string | null>(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  // Field Touched Tracking
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError =
    touched.password && !password.trim() ? 'Password is required.' : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrorMessage(null);
    setBackendOfflineNotice(null);
    setSuccessMessage(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({ email, password });

      if (result.success) {
        setSuccessMessage('Authentication successful! Opening your workspace...');
        setTimeout(() => {
          navigate('/app');
        }, 1000);
      } else if (result.isBackendOffline) {
        setBackendOfflineNotice(
          'Backend Authentication Service (/api/v1/auth/login) is not reachable. Please ensure the backend server is running.'
        );
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected login error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await demoLogin();
      if (result.success) {
        setSuccessMessage('Signing in as Demo User (Ayesha Khan)...');
        setTimeout(() => {
          navigate('/app');
        }, 800);
      } else {
        setErrorMessage(result.error || 'Failed to authenticate as demo user.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Demo sign-in error.');
    } finally {
      setLoading(false);
    }
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
          <span className="text-slate-400 hidden sm:inline">Need an account?</span>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 border border-white/10 hover:border-purple-400/50 shadow-sm transition-all font-semibold"
          >
            Create Account
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
                <span>Secure Financial Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Log In to Accora
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Access your real-time financials, forecasting models, and AI Copilot.
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

            {/* Backend Offline Notice */}
            {backendOfflineNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
                <div className="flex items-start gap-2 text-amber-300 font-semibold">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Backend Auth Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {backendOfflineNotice}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all cursor-pointer"
                  >
                    <span>Sign In With Demo Account Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModalOpen(true)}
                    className="text-xs text-purple-300 hover:text-purple-200 underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
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
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030712] border text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-800 focus:border-purple-400 focus:ring-purple-500/20'
                    }`}
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
                {passwordError && (
                  <p className="text-[11px] text-rose-400 pl-1">{passwordError}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-600 hover:to-indigo-600 border border-white/10 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Demo Sign In Option */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Sign In With Demo Account Now</span>
            </button>

            {/* Alternate Signup Link */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-purple-300 hover:text-purple-200 underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <p>&copy; {getCurrentYear()} Accora Financial Technologies. Bank-grade 256-bit encryption.</p>
      </footer>

      {/* Forgot Password Modal */}
      {forgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#060919] border border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setForgotPasswordModalOpen(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Password Recovery Notice
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Self-service password recovery is currently being deployed.
              </p>
              <div className="p-3.5 rounded-xl bg-[#030712] border border-slate-800 space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>
                  Because Accora manages sensitive deterministic ledger records, password resets must be authorized by an organization administrator.
                </p>
                <p>
                  To explore the platform right now, you can use the instant <strong className="text-purple-300">Demo Account Sign-In</strong> button on the login screen.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
