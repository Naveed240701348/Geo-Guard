import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to console for debugging
    console.group('🚨 Error Boundary Caught an Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="bg-panel rounded-lg p-8 max-w-md w-full border border-border">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
              <p className="text-muted mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-info hover:text-info/80 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-bg rounded p-3 text-xs text-danger font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error?.toString()}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-panel text-white border border-border rounded-lg hover:bg-panel/90 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>

              {/* Help Section */}
              <div className="mt-6 p-4 bg-info/20 border border-info rounded">
                <h4 className="text-sm font-medium text-info mb-2">What you can do:</h4>
                <ul className="text-xs text-muted space-y-1 text-left">
                  <li>• Refresh the page and try again</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Network Error Component
export function NetworkError({ onRetry }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-panel rounded-lg p-8 max-w-md w-full border border-border text-center">
        <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Connection Error</h1>
        <p className="text-muted mb-6">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-warning text-bg rounded-lg hover:bg-warning/90 transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-panel text-white border border-border rounded-lg hover:bg-panel/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

// 404 Not Found Component
export function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-panel rounded-lg p-8 max-w-md w-full border border-border text-center">
        <div className="w-16 h-16 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-info">404</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-muted mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}

export { ErrorBoundary, NetworkError, NotFound };
