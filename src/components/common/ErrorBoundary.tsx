import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] flex items-center justify-center p-6 bg-brand-canvas text-brand-graphite-900">
          <div className="max-w-lg w-full bg-white border border-red-200 rounded p-6 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-brand-red">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-brand-graphite-900 mb-1">
              {this.props.fallbackTitle || 'Component Rendering Error'}
            </h2>
            <p className="text-xs text-brand-graphite-600 mb-4 leading-relaxed">
              {this.props.fallbackDescription ||
                'An unexpected error occurred while rendering this section. Your persisted records are safe.'}
            </p>

            {this.state.error && (
              <div className="p-3 mb-5 bg-brand-graphite-50 rounded border border-brand-border text-left font-mono text-xs text-red-700 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-brand-red text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded border border-brand-border text-brand-graphite-700 hover:bg-brand-graphite-50 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
