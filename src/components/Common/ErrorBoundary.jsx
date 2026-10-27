import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-xl text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Something went wrong while rendering this section.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-3 mb-4 p-3 text-xs text-left bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded overflow-auto max-h-40 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
