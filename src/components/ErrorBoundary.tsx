import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#141413] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#D6D4CC] rounded-[2px] p-7 space-y-4">
            <p className="font-mono-tabular text-xs text-[#6B6A65]">System Notice</p>
            <h1 className="font-editorial text-2xl font-semibold text-[#141413]">
              Unable to load this view
            </h1>
            <p className="text-sm text-[#575652] leading-relaxed">
              A connection or permission issue occurred while loading portfolio data. Please reload
              the page or return to the public portfolio.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#9E3B2E] rounded-[2px] transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-4 py-2 text-xs font-medium text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-[2px] transition-colors"
              >
                Return to Portfolio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
