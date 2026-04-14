import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Complaints() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    admin_remarks: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const endpoint = profile?.role === 'admin' ? '/complaints' : '/complaints/mine';
      const response = await axios.get(endpoint);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const handleUpdate = async () => {
    console.log('Updating complaint:', selectedComplaint.id, updateData);
    try {
      const response = await axios.put(`/complaints/${selectedComplaint.id}`, updateData);
      console.log('Update response:', response.data);
      fetchComplaints();
      setShowUpdateModal(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint:', error.response?.data || error.message);
      alert(`Error updating complaint: ${error.response?.data?.message || error.message}`);
    }
  };

  const openUpdateModal = (complaint) => {
    console.log('Opening update modal for complaint:', complaint);
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      admin_remarks: complaint.admin_remarks || ''
    });
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-xl">Loading complaints...</div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <a href={isAdmin ? "/admin" : "/dashboard"} className="text-muted hover:text-white mr-4">
              Back to {isAdmin ? "Admin" : "Dashboard"}
            </a>
            <h1 className="text-xl font-bold text-white">
              {isAdmin ? "All Complaints" : "My Complaints"}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'open', 'in_review', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-bg'
                  : 'bg-panel text-muted hover:text-white border border-border'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              <span className="ml-2 text-xs">
                ({complaints.filter(c => status === 'all' ? true : c.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Complaints List */}
        {isAdmin ? (
          // Admin View - Table
          <div className="bg-panel rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Survey No</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Citizen</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map(complaint => (
                    <tr key={complaint.id} className="border-b border-border">
                      <td className="py-3 px-4 text-white">#{complaint.id.slice(-6)}</td>
                      <td className="py-3 px-4 text-white">{complaint.survey_no}</td>
                      <td className="py-3 px-4 text-white">{complaint.user_name}</td>
                      <td className="py-3 px-4 text-white max-w-xs truncate">{complaint.description}</td>
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
                        <button
                          onClick={() => openUpdateModal(complaint)}
                          className="text-info hover:underline"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Citizen View - Cards
          <div className="space-y-4">
            {filteredComplaints.map(complaint => (
              <div key={complaint.id} className="bg-panel rounded-lg p-6 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Complaint #{complaint.id.slice(-6)}
                    </h3>
                    <p className="text-muted mb-2">Survey Number: {complaint.survey_no}</p>
                    <p className="text-white">{complaint.description}</p>
                    {complaint.photo_url && (
                      <img 
                        src={complaint.photo_url} 
                        alt="Complaint evidence" 
                        className="mt-4 rounded-lg max-w-sm"
                      />
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    complaint.status === 'open' ? 'bg-danger/20 text-danger' :
                    complaint.status === 'in_review' ? 'bg-warning/20 text-warning' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {complaint.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-muted mb-2">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span className="text-white">Complaint filed</span>
                      <span className="text-muted ml-auto">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {complaint.updated_at !== complaint.created_at && (
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-info rounded-full mr-3"></div>
                        <span className="text-white">Status updated</span>
                        <span className="text-muted ml-auto">
                          {new Date(complaint.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {complaint.admin_remarks && (
                      <div className="mt-2 p-3 bg-bg rounded text-sm">
                        <span className="text-muted">Admin Remarks:</span>
                        <p className="text-white mt-1">{complaint.admin_remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-lg">
              {filter === 'all' ? 'No complaints found.' : `No ${filter} complaints found.`}
            </p>
          </div>
        )}
      </div>

      {/* Update Modal (Admin Only) */}
      {isAdmin && showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-panel rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Update Complaint</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Admin Remarks</label>
                <textarea
                  value={updateData.admin_remarks}
                  onChange={(e) => setUpdateData({...updateData, admin_remarks: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="Add remarks about this complaint..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-2 bg-panel text-white border border-border rounded-lg hover:bg-panel/90 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
