/**
 * NotFoundPage — displayed when a user navigates to an unknown route.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-surface-card">
      <div className="text-center max-w-md px-6">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-surface-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
