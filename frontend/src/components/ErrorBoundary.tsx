/**
 * ErrorBoundary — catches render errors in child components and shows
 * a clean Accora-branded fallback instead of a blank white screen.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-surface-card">
          <div className="text-center max-w-md px-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-600 text-xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold text-surface-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-surface-500 mb-6">
              Accora encountered an unexpected error. You can reload to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Reload Accora
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
