import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function CitizenDashboard() {
  const { profile, logout } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    survey_no: '',
    description: '',
    lat: 12.9675,
    lng: 80.1491,
    photo: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parcelsRes, complaintsRes] = await Promise.all([
        axios.get('/parcels'),
        axios.get('/complaints/mine')
      ]);
      
      setParcels(parcelsRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    if (!profile) {
      alert('Please log in to file a complaint');
      return;
    }
    
    console.log('Submitting complaint...');
    console.log('User profile:', profile);
    
    try {
      const formData = new FormData();
      formData.append('survey_no', complaintForm.survey_no);
      formData.append('description', complaintForm.description);
      formData.append('lat', complaintForm.lat);
      formData.append('lng', complaintForm.lng);
      if (complaintForm.photo) {
        formData.append('photo', complaintForm.photo);
      }
      
      console.log('Sending request to /complaints');
      const response = await axios.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Complaint submitted successfully:', response.data);
      
      setComplaintForm({
        survey_no: '',
        description: '',
        lat: 12.9675,
        lng: 80.1491,
        photo: null
      });
      setShowComplaintForm(false);
      fetchData();
    } catch (error) {
      console.error('Error filing complaint:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const myParcels = parcels.filter(p => p.owner_name === profile?.name);
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const pendingComplaints = complaints.filter(c => c.status === 'open' || c.status === 'in_review').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-xl">Loading dashboard...</div>
      </div>
    );
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
            <h1 className="text-xl font-bold text-white">GeoGuard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-muted">
              Welcome, <span className="text-white font-medium">{profile?.name}</span>
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
        {/* Welcome Card */}
        <div className="bg-panel rounded-lg p-6 mb-8 border border-border">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, {profile?.name}</h2>
          <p className="text-muted">Monitor your land parcels and track complaint status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-primary mb-2">{myParcels.length}</div>
            <div className="text-muted">My Parcels</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-info mb-2">{complaints.length}</div>
            <div className="text-muted">My Complaints</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-primary mb-2">{resolvedComplaints}</div>
            <div className="text-muted">Resolved</div>
          </div>
          <div className="bg-panel rounded-lg p-6 border border-border">
            <div className="text-3xl font-bold text-warning mb-2">{pendingComplaints}</div>
            <div className="text-muted">Pending</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => setShowComplaintForm(true)}
            className="px-6 py-3 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="mr-2">File New Complaint</span>
          </button>
          <Link to="/map" className="px-6 py-3 bg-info text-white rounded-lg hover:bg-info/90 transition-colors inline-block">
            <span className="mr-2">View GIS Map</span>
          </Link>
          <Link to="/complaints" className="px-6 py-3 bg-panel text-white border border-border rounded-lg hover:bg-panel/90 transition-colors inline-block">
            <span className="mr-2">My Complaints</span>
          </Link>
        </div>

        {/* My Land Parcels */}
        <div className="bg-panel rounded-lg p-6 mb-8 border border-border">
          <h3 className="text-xl font-semibold text-white mb-4">My Land Parcels</h3>
          <div className="space-y-4">
            {myParcels.length === 0 ? (
              <p className="text-muted">No parcels found under your name.</p>
            ) : (
              myParcels.map(parcel => (
                <div key={parcel.id} className="bg-bg rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{parcel.survey_no}</div>
                      <div className="text-sm text-muted">{parcel.village}, {parcel.taluk}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parcel.land_type === 'private' ? 'bg-warning/20 text-warning' :
                        parcel.land_type === 'government' ? 'bg-info/20 text-info' :
                        parcel.land_type === 'poramboke' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {parcel.land_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parcel.status === 'clear' ? 'bg-primary/20 text-primary' :
                        parcel.status === 'encroached' ? 'bg-danger/20 text-danger' :
                        parcel.status === 'disputed' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {parcel.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-panel rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold text-white mb-4">My Complaints</h3>
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <p className="text-muted">No complaints filed yet.</p>
            ) : (
              complaints.slice(0, 5).map(complaint => (
                <div key={complaint.id} className="bg-bg rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">#{complaint.id.slice(-6)}</div>
                      <div className="text-sm text-muted">Survey: {complaint.survey_no}</div>
                      <div className="text-sm text-muted">{new Date(complaint.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      complaint.status === 'open' ? 'bg-danger/20 text-danger' :
                      complaint.status === 'in_review' ? 'bg-warning/20 text-warning' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">File New Complaint</h3>
            <form onSubmit={handleSubmitComplaint}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Survey Number</label>
                <input
                  type="text"
                  value={complaintForm.survey_no}
                  onChange={(e) => setComplaintForm({...complaintForm, survey_no: e.target.value})}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter survey number"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Description</label>
                <textarea
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Photo (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setComplaintForm({...complaintForm, photo: e.target.files[0]})}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  accept="image/*"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Complaint
                </button>
                <button
                  type="button"
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 px-4 py-2 bg-bg border border-border text-muted rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
