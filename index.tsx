import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppSkeleton } from './components/Skeletons';

// Lazy load the main App component
const App = lazy(() => import('./App'));

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state as a class property to satisfy TypeScript strict property initialization
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-red-50 p-4 font-sans">
          <div className="max-w-lg w-full rounded-lg bg-white p-6 shadow-xl border border-red-100">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4 text-sm">The application encountered an error and could not render.</p>
            <div className="bg-slate-100 p-3 rounded text-xs text-red-500 overflow-auto max-h-48 font-mono mb-4 border border-slate-200">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
                Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<AppSkeleton />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);