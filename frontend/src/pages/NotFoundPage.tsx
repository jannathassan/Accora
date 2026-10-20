import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50 text-surface-900 px-6 font-sans">
      <div className="text-center max-w-md w-full bg-surface-card border border-surface-200 shadow-[var(--shadow-card)] p-8 rounded-[var(--radius-card)]">
        <div className="w-12 h-12 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center mx-auto mb-4 text-brand-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-2 font-sans">Page Not Found</h1>
        <p className="text-sm text-surface-500 mb-6 font-sans">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
