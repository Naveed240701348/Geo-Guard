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

  // Process citizen statistics
  const citizenStats = complaints.reduce((acc, complaint) => {
    const citizenId = complaint.user_id;
    const citizenName = complaint.user_name;
    
    if (!acc[citizenId]) {
      acc[citizenId] = {
        name: citizenName,
        email: citizenId.includes('@') ? citizenId : `${citizenId}@example.com`,
        totalComplaints: 0,
        openComplaints: 0,
        resolvedComplaints: 0,
        lastComplaintDate: null,
        surveyNumbers: new Set()
      };
    }
    
    acc[citizenId].totalComplaints++;
    if (complaint.status === 'open') acc[citizenId].openComplaints++;
    if (complaint.status === 'resolved') acc[citizenId].resolvedComplaints++;
    
    const complaintDate = new Date(complaint.created_at);
    if (!acc[citizenId].lastComplaintDate || complaintDate > acc[citizenId].lastComplaintDate) {
      acc[citizenId].lastComplaintDate = complaintDate;
    }
    
    if (complaint.survey_no) {
      acc[citizenId].surveyNumbers.add(complaint.survey_no);
    }
    
    return acc;
  }, {});

  // Convert to array and sort by total complaints
  const citizensList = Object.values(citizenStats)
    .map(citizen => ({
      ...citizen,
      surveyNumbers: Array.from(citizen.surveyNumbers),
      lastComplaintDate: citizen.lastComplaintDate?.toLocaleDateString() || '-'
    }))
    .sort((a, b) => b.totalComplaints - a.totalComplaints)
    .slice(0, 8); // Show top 8 citizens

  // Additional quick stats
  const avgResolutionTime = complaints
    .filter(c => c.status === 'resolved')
    .reduce((sum, c) => {
      const created = new Date(c.created_at);
      const updated = new Date(c.updated_at);
      return sum + Math.floor((updated - created) / (1000 * 60 * 60 * 24));
    }, 0) / complaints.filter(c => c.status === 'resolved').length || 0;

  const complaintsThisWeek = complaints.filter(c => {
    const complaintDate = new Date(c.created_at);
    const daysDiff = Math.floor((new Date() - complaintDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }).length;

  const uniqueCitizens = Object.keys(citizenStats).length;
  const parcelsWithComplaints = new Set(complaints.map(c => c.survey_no).filter(Boolean)).size;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-success mb-2">{uniqueCitizens}</div>
            <div className="text-muted">Active Citizens</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-purple-400 mb-2">{complaintsThisWeek}</div>
            <div className="text-muted">This Week</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-orange-400 mb-2">{Math.round(avgResolutionTime)}d</div>
            <div className="text-muted">Avg Resolution</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{parcelsWithComplaints}</div>
            <div className="text-muted">Parcels with Issues</div>
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

        {/* Active Citizens Section */}
        <div className="bg-panel rounded-lg p-6 border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Active Citizens</h3>
            <div className="text-muted text-sm">Top citizens by complaint activity</div>
          </div>
          
          {citizensList.length === 0 ? (
            <p className="text-muted text-center py-8">No citizen complaints found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {citizensList.map((citizen, index) => (
                <div key={citizen.email} className="bg-bg rounded-lg p-4 border border-border hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{citizen.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-muted">#{index + 1}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="font-medium text-white text-sm">{citizen.name}</div>
                      <div className="text-xs text-muted truncate">{citizen.email}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-panel rounded p-2">
                        <div className="text-lg font-bold text-white">{citizen.totalComplaints}</div>
                        <div className="text-xs text-muted">Total</div>
                      </div>
                      <div className="bg-panel rounded p-2">
                        <div className="text-lg font-bold text-warning">{citizen.openComplaints}</div>
                        <div className="text-xs text-muted">Open</div>
                      </div>
                      <div className="bg-panel rounded p-2">
                        <div className="text-lg font-bold text-primary">{citizen.resolvedComplaints}</div>
                        <div className="text-xs text-muted">Resolved</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted mb-1">Survey Numbers:</div>
                      <div className="flex flex-wrap gap-1">
                        {citizen.surveyNumbers.slice(0, 3).map((survey, i) => (
                          <span key={i} className="text-xs bg-info/20 text-info px-2 py-1 rounded">
                            {survey}
                          </span>
                        ))}
                        {citizen.surveyNumbers.length > 3 && (
                          <span className="text-xs text-muted">+{citizen.surveyNumbers.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted">
                      Last activity: {citizen.lastComplaintDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
