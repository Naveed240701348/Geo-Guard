import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

export default function Profile() {
  const { user, profile, logout, resendEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar_last4: ''
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        aadhaar_last4: profile.aadhaar_last4 || ''
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Update display name in Firebase Auth
      if (profileForm.name !== user.displayName) {
        await updateProfile(user, {
          displayName: profileForm.name
        });
      }

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileForm.name,
        phone: profileForm.phone,
        aadhaar_last4: profileForm.aadhaar_last4,
        updated_at: new Date().toISOString()
      });

      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Note: This would require implementing password change in backend
      setMessage('Password change functionality coming soon!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resendEmailVerification();
      setMessage('Email verification sent! Please check your inbox and spam folder.');
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  if (!user || !profile) {
    console.log('Profile: user or profile not loaded', { user: !!user, profile: !!profile });
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-muted hover:text-white mr-4"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-white">My Profile</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-panel rounded-lg p-6 border border-border">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-bg">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                <p className="text-muted">{profile.role}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-primary text-bg'
                      : 'text-muted hover:text-white hover:bg-bg'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'edit'
                      ? 'bg-primary text-bg'
                      : 'text-muted hover:text-white hover:bg-bg'
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-primary text-bg'
                      : 'text-muted hover:text-white hover:bg-bg'
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Messages */}
            {message && (
              <div className="mb-4 p-3 bg-success/20 border border-success text-success rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-danger/20 border border-danger text-danger rounded">
                {error}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="bg-panel rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold text-white mb-6">Profile Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted mb-4">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted">Full Name:</span>
                        <span className="text-white ml-2">{profile.name}</span>
                      </div>
                      <div>
                        <span className="text-muted">Email:</span>
                        <span className="text-white ml-2">{profile.email}</span>
                      </div>
                      <div>
                        <span className="text-muted">Phone:</span>
                        <span className="text-white ml-2">{profile.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-muted">Aadhaar (last 4):</span>
                        <span className="text-white ml-2">{profile.aadhaar_last4 || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted mb-4">Account Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted">User ID:</span>
                        <span className="text-white ml-2 text-xs">{user.uid}</span>
                      </div>
                      <div>
                        <span className="text-muted">Role:</span>
                        <span className="text-white ml-2 capitalize">{profile.role}</span>
                      </div>
                      <div>
                        <span className="text-muted">Member Since:</span>
                        <span className="text-white ml-2">
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Email Verified:</span>
                        <span className="text-white ml-2">
                          {user.emailVerified ? '✅ Yes' : '❌ No'}
                        </span>
                        {!user.emailVerified && (
                          <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="ml-2 px-3 py-1 bg-info text-bg text-xs rounded hover:bg-info/90 transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Sending...' : 'Resend Verification'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile Tab */}
            {activeTab === 'edit' && (
              <div className="bg-panel rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold text-white mb-6">Edit Profile</h3>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-4 py-2 bg-bg/50 border border-border rounded-lg text-muted"
                      />
                      <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Aadhaar (Last 4)</label>
                      <input
                        type="text"
                        value={profileForm.aadhaar_last4}
                        onChange={(e) => setProfileForm({...profileForm, aadhaar_last4: e.target.value})}
                        className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                        placeholder="Last 4 digits"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-panel rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  {/* Password Change */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Change Password</h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                          placeholder="Confirm new password"
                          minLength={6}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-warning text-bg rounded-lg hover:bg-warning/90 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Change Password'}
                      </button>
                    </form>
                  </div>

                  {/* Security Info */}
                  <div className="p-4 bg-info/20 border border-info rounded">
                    <h4 className="text-sm font-medium text-info mb-2">Security Tips</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Use a strong password with at least 6 characters</li>
                      <li>• Include numbers and special characters</li>
                      <li>• Don't share your password with anyone</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
