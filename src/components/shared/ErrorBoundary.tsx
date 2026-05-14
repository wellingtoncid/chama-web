import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    try {
      const SentryModule = (window as any).__SENTRY__;
      if (SentryModule?.captureException) {
        SentryModule.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
      }
    } catch {}
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900">Algo deu errado</h1>
              <p className="text-sm text-slate-500">
                Ocorreu um erro inesperado. Nossa equipe já foi notificada.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-3 p-3 bg-slate-100 rounded-lg text-xs text-left text-red-600 overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack?.split('\n').slice(1, 4).join('\n')}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                Tentar novamente
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Home size={16} />
                Voltar ao início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
