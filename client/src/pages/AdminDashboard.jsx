import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function AdminDashboard() {
  const { profile, logout } = useAuth();
  console.log('AdminDashboard loading with profile:', profile);
  console.log('Current role:', profile?.role);
  const [parcels, setParcels] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parcelsRes, complaintsRes] = await Promise.all([
        axios.get('/parcels'),
        axios.get('/complaints')
      ]);
      
      setParcels(parcelsRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalParcels = parcels.length;
  const encroachments = parcels.filter(p => p.status === 'encroached').length;
  const openComplaints = complaints.filter(c => c.status === 'open').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    console.log('Not admin, redirecting to citizen dashboard. Current role:', profile?.role);
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-bg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">🛡️ ADMIN PANEL 🛡️</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-muted">
              Admin Panel | Role: <span className="text-warning font-bold">{profile?.role || 'NOT SET'}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Welcome Card */}
        <div className="bg-panel rounded-lg p-6 mb-8 border-2 border-warning">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
            <h2 className="text-2xl font-bold text-warning">Admin Dashboard</h2>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Welcome, {profile?.name}</h3>
          <p className="text-muted">Manage all land parcels, complaints, and system data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-info mb-2">{totalParcels}</div>
            <div className="text-muted">Total Parcels</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-danger mb-2">{encroachments}</div>
            <div className="text-muted">Encroachments</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-warning mb-2">{openComplaints}</div>
            <div className="text-muted">Open Complaints</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-primary mb-2">{resolvedComplaints}</div>
            <div className="text-muted">Resolved</div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/import" className="bg-panel rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer">
            <div className="text-2xl mb-3">Import via CSV</div>
            <div className="text-muted">Upload land parcel data</div>
          </Link>
          <Link to="/map" className="bg-panel rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer">
            <div className="text-2xl mb-3">View GIS Map</div>
            <div className="text-muted">Interactive parcel mapping</div>
          </Link>
          <Link to="/land-records" className="bg-panel rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer">
            <div className="text-2xl mb-3">Manage Land Records</div>
            <div className="text-muted">View and edit parcels</div>
          </Link>
          <Link to="/complaints" className="bg-panel rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer">
            <div className="text-2xl mb-3">View All Complaints</div>
            <div className="text-muted">Manage citizen reports</div>
          </Link>
        </div>

        {/* Recent Complaints Table */}
        <div className="bg-panel rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Complaints</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Survey No</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Citizen</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Village</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 10).map(complaint => (
                  <tr key={complaint.id} className="border-b border-border">
                    <td className="py-3 px-4 text-white">#{complaint.id.slice(-6)}</td>
                    <td className="py-3 px-4 text-white">{complaint.survey_no}</td>
                    <td className="py-3 px-4 text-white">{complaint.user_name}</td>
                    <td className="py-3 px-4 text-white">-</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        complaint.status === 'open' ? 'bg-danger/20 text-danger' :
                        complaint.status === 'in_review' ? 'bg-warning/20 text-warning' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-info hover:underline">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
