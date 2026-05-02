import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: success
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Password reset link has been sent to your email address.');
      setStep(2);
    } catch (err) {
      setError('Failed to send reset link. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Panel */}
      <div className="flex-1 bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-bg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">GeoGuard</h1>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Password Reset</h2>
          <p className="text-muted">Recover access to your GeoGuard account securely.</p>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="w-full max-w-md bg-panel p-8">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-bg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">GeoGuard</h1>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {step === 1 ? 'Reset Your Password' : 'Check Your Email'}
          </h2>
          <p className="text-muted text-sm">
            {step === 1 
              ? 'Enter your email address and we\'ll send you a link to reset your password.'
              : 'We\'ve sent a password reset link to your email address.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger text-danger rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-success/20 border border-success text-success rounded">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-primary"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-info/20 border border-info text-info rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new password</li>
                    <li>Return to login</li>
                  </ol>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-muted">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>

        <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
          <h4 className="text-sm font-medium text-white mb-2">Having Trouble?</h4>
          <ul className="text-xs text-muted space-y-1">
            <li>• Check your spam folder for the reset email</li>
            <li>• Ensure you entered the correct email address</li>
            <li>• Contact support if you don't receive the email within 5 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
