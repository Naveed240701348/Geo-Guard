import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function LandRecords() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    district: '',
    taluk: '',
    landType: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingParcel, setEditingParcel] = useState(null);
  const [formData, setFormData] = useState({
    survey_no: '',
    sub_division: '',
    area_acres: '',
    district: '',
    taluk: '',
    village: '',
    land_type: 'private',
    status: 'active',
    centroid_lat: '',
    centroid_lng: ''
  });

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await axios.get('/parcels');
      setParcels(response.data);
    } catch (error) {
      console.error('Error fetching parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = !searchTerm || 
      (parcel.survey_number || parcel.survey_no).toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.sub_division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.taluk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = !filters.district || parcel.district === filters.district;
    const matchesTaluk = !filters.taluk || parcel.taluk === filters.taluk;
    const matchesLandType = !filters.landType || parcel.land_type === filters.landType;
    const matchesStatus = !filters.status || parcel.status === filters.status;
    
    const shouldShow = matchesSearch && matchesDistrict && matchesTaluk && matchesLandType && matchesStatus;
    return shouldShow;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map form field names to backend field names
      const submissionData = {
        survey_number: formData.survey_no,
        sub_division: formData.sub_division,
        area_acres: formData.area_acres,
        district: formData.district,
        taluk: formData.taluk,
        village: formData.village,
        land_type: formData.land_type,
        status: formData.status,
        centroid_lat: formData.centroid_lat,
        centroid_lng: formData.centroid_lng
      };
      
      if (editingParcel) {
        await axios.put(`/parcels/${editingParcel.id}`, submissionData);
      } else {
        await axios.post('/parcels', submissionData);
      }
      
      fetchParcels();
      setShowModal(false);
      setEditingParcel(null);
      resetForm();
    } catch (error) {
      console.error('Error saving parcel:', error);
    }
  };

  const handleEdit = (parcel) => {
    setEditingParcel(parcel);
    setFormData({
      survey_no: parcel.survey_number || parcel.survey_no || '',
      sub_division: parcel.sub_division || '',
      area_acres: parcel.area_acres || '',
      district: parcel.district || '',
      taluk: parcel.taluk || '',
      village: parcel.village || '',
      land_type: parcel.land_type || 'private',
      status: parcel.status || 'active',
      centroid_lat: parcel.latitude || parcel.centroid_lat || '',
      centroid_lng: parcel.longitude || parcel.centroid_lng || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (parcelId) => {
    if (confirm('Are you sure you want to delete this parcel?')) {
      try {
        await axios.delete(`/parcels/${parcelId}`);
        fetchParcels();
      } catch (error) {
        console.error('Error deleting parcel:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      survey_no: '',
      sub_division: '',
      ulpin: '',
      village_lgd_code: '',
      patta_no: '',
      owner_name: '',
      area_acres: '',
      district: '',
      taluk: '',
      village: '',
      land_type: 'private',
      status: 'clear',
      centroid_lat: '',
      centroid_lng: ''
    });
  };

  const districts = [...new Set(parcels.map(p => p.district))];
  const taluks = [...new Set(parcels.map(p => p.taluk))];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-xl">Loading land records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/admin" className="text-muted hover:text-white mr-4">
              Back to Admin
            </Link>
            <h1 className="text-xl font-bold text-white">Land Records Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingParcel(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Parcel
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-panel rounded-lg p-6 mb-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by survey number, subdivision, or land type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-primary"
            />
            
            <select
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            <select
              value={filters.taluk}
              onChange={(e) => setFilters({...filters, taluk: e.target.value})}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Taluks</option>
              {taluks.map(taluk => (
                <option key={taluk} value={taluk}>{taluk}</option>
              ))}
            </select>

            <select
              value={filters.landType}
              onChange={(e) => setFilters({...filters, landType: e.target.value})}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Land Types</option>
              <option value="private">Private</option>
              <option value="government">Government</option>
              <option value="poramboke">Poramboke</option>
              <option value="forest">Forest</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="clear">Clear</option>
              <option value="encroached">Encroached</option>
              <option value="disputed">Disputed</option>
              <option value="government">Government</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-panel rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium">Survey No</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Sub Div</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">District</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Taluk</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Village</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Land Type</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map(parcel => (
                  <tr key={parcel.id} className="border-b border-border">
                    <td className="py-3 px-4 text-white">{parcel.survey_number || parcel.survey_no}</td>
                    <td className="py-3 px-4 text-white">{parcel.sub_division}</td>
                    <td className="py-3 px-4 text-white">{parcel.district}</td>
                    <td className="py-3 px-4 text-white">{parcel.taluk}</td>
                    <td className="py-3 px-4 text-white">{parcel.village}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parcel.land_type === 'private' ? 'bg-warning/20 text-warning' :
                        parcel.land_type === 'government' ? 'bg-info/20 text-info' :
                        parcel.land_type === 'poramboke' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {parcel.land_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parcel.status === 'active' ? 'bg-primary/20 text-primary' :
                        parcel.status === 'encroached' ? 'bg-danger/20 text-danger' :
                        parcel.status === 'disputed' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(parcel)}
                          className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(parcel.id)}
                          className="px-3 py-1 bg-danger text-white rounded hover:bg-danger/90 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-panel rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingParcel ? 'Edit Parcel' : 'Add New Parcel'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Survey Number</label>
                  <input
                    type="text"
                    value={formData.survey_no}
                    onChange={(e) => setFormData({...formData, survey_no: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Sub Division</label>
                  <input
                    type="text"
                    value={formData.sub_division}
                    onChange={(e) => setFormData({...formData, sub_division: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.area_acres}
                    onChange={(e) => setFormData({...formData, area_acres: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Taluk</label>
                  <input
                    type="text"
                    value={formData.taluk}
                    onChange={(e) => setFormData({...formData, taluk: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({...formData, village: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.centroid_lat}
                    onChange={(e) => setFormData({...formData, centroid_lat: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.centroid_lng}
                    onChange={(e) => setFormData({...formData, centroid_lng: e.target.value})}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingParcel ? 'Update' : 'Add'} Parcel
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-panel text-white border border-border rounded-lg hover:bg-panel/90 transition-colors"
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
