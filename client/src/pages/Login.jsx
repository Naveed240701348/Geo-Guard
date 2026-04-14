import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('citizen');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect based on active tab
      if (activeTab === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password');
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
          <h2 className="text-2xl font-semibold text-white mb-4">GIS-Based Government Land Protection System</h2>
          <p className="text-muted">Protecting Tamil Nadu's land resources through advanced monitoring and encroachment detection technology.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
          <h2 className="text-xl font-semibold text-white">
            {activeTab === 'admin' ? 'Admin Login' : 'Citizen Login'}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-border">
          <button 
            onClick={() => setActiveTab('citizen')}
            className={`flex-1 pb-2 border-b-2 transition-colors ${
              activeTab === 'citizen' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            Citizen Login
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex-1 pb-2 border-b-2 transition-colors ${
              activeTab === 'admin' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger text-danger rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-primary"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-primary"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </div>

        {activeTab === 'admin' && (
          <div className="mt-4 p-3 bg-info/20 border border-info text-info text-sm rounded">
            <strong>Note:</strong> Admin access requires your user role to be set to "admin" in Firebase Firestore.
          </div>
        )}
      </div>
    </div>
  );
}
