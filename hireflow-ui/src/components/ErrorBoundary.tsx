import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fee2e2' }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Something went wrong</h2>
          <p className="text-sm text-center mb-6 max-w-sm" style={{ color: '#64748b' }}>
            This page encountered an error. Click refresh to try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          {this.state.error && (
            <pre className="mt-4 text-xs text-red-600 bg-red-50 p-3 rounded-lg max-w-full overflow-auto" style={{ maxWidth: 500 }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
