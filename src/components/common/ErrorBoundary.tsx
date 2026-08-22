import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PairPlay encountered an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF9F6] dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>

            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-bold font-display text-neutral-800 dark:text-neutral-100 mb-2">
              Something went slightly off track
            </h2>

            <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed">
              Don't worry, your games and scores can be safely restarted in a moment.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload PairPlay</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
