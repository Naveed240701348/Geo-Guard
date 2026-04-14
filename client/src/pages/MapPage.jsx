import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import axios from '../api/axios';

function MapBounds({ parcels }) {
  const map = useMap();
  
  useEffect(() => {
    if (parcels.length > 0) {
      const bounds = new LatLngBounds();
      parcels.forEach(parcel => {
        bounds.extend([parcel.centroid_lat, parcel.centroid_lng]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [parcels, map]);

  return null;
}

export default function MapPage() {
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [baseMap, setBaseMap] = useState('street');
  const [layers, setLayers] = useState({
    cadastral: true,
    encroachment: true,
    ownership: true,
    complaints: true,
    villageBoundaries: false,
    bhuvanWMS: false
  });
  const [coordinates, setCoordinates] = useState({ lat: 12.9675, lng: 80.1491 });
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter parcels based on search term
  const filteredParcels = parcels.filter(parcel => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return parcel.survey_no.toLowerCase().includes(searchLower) ||
           parcel.sub_division.toLowerCase().includes(searchLower) ||
           parcel.land_type.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching map data...');
      const [parcelsRes, complaintsRes] = await Promise.all([
        axios.get('/parcels'),
        axios.get('/complaints')
      ]);
      
      console.log('Parcels received:', parcelsRes.data.length, 'parcels');
      console.log('First parcel:', parcelsRes.data[0]);
      console.log('Complaints received:', complaintsRes.data.length, 'complaints');
      console.log('First complaint:', complaintsRes.data[0]);
      setParcels(parcelsRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getParcelColor = (landType) => {
    switch (landType) {
      case 'private': return '#f5c518';
      case 'government': return '#3b9eff';
      case 'poramboke': return '#a855f7';
      case 'forest': return '#10d97a';
      default: return '#f5c518';
    }
  };

  const getParcelBorderColor = (status) => {
    switch (status) {
      case 'encroached': return '#ff4557';
      case 'disputed': return '#f97316';
      case 'government': return '#3b9eff';
      case 'clear': return '#ffffff33';
      default: return '#ffffff33';
    }
  };

  const getParcelBorderDash = (status) => {
    return (status === 'encroached' || status === 'disputed') ? "6 3" : null;
  };

  const getParcelBorderWeight = (status) => {
    return (status === 'encroached' || status === 'disputed') ? 2.5 : 1.5;
  };

  const handleMapClick = (e) => {
    setCoordinates({
      lat: e.latlng.lat.toFixed(5),
      lng: e.latlng.lng.toFixed(5)
    });
  };

  const handleParcelClick = (parcel) => {
    setSelectedParcel(parcel);
  };

  const baseMapLayers = {
    street: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-xl">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-panel border-r border-border p-4 overflow-y-auto">
        {/* Logo and Title */}
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-bg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">GeoGuard</h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by survey number, subdivision, or land type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Base Map Toggle */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted mb-2">Base Map</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(baseMapLayers).map(map => (
              <button
                key={map}
                onClick={() => setBaseMap(map)}
                className={`px-3 py-2 rounded text-xs font-medium capitalize ${
                  baseMap === map
                    ? 'bg-primary text-bg'
                    : 'bg-bg text-muted hover:text-white'
                }`}
              >
                {map}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted mb-2">Layers</h3>
          <div className="space-y-2">
            {Object.entries({
              cadastral: { label: 'Cadastral Parcels', color: 'bg-primary' },
              encroachment: { label: 'Encroachment Zones', color: 'bg-danger' },
              ownership: { label: 'Ownership Layer', color: 'bg-info' },
              complaints: { label: 'Complaint Markers', color: 'bg-warning' },
              villageBoundaries: { label: 'Village Boundaries', color: 'bg-purple-500' },
              bhuvanWMS: { label: 'Bhuvan WMS', color: 'bg-orange-500' }
            }).map(([key, { label, color }]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-white">{label}</span>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    layers[key] ? color : 'bg-border'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    layers[key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* District Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted mb-2">District Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-bg rounded p-2">
              <div className="text-primary font-bold">{parcels.length}</div>
              <div className="text-muted">Total</div>
            </div>
            <div className="bg-bg rounded p-2">
              <div className="text-warning font-bold">{parcels.filter(p => p.land_type === 'private').length}</div>
              <div className="text-muted">Private</div>
            </div>
            <div className="bg-bg rounded p-2">
              <div className="text-info font-bold">{parcels.filter(p => p.land_type === 'government').length}</div>
              <div className="text-muted">Govt</div>
            </div>
            <div className="bg-bg rounded p-2">
              <div className="text-danger font-bold">{parcels.filter(p => p.status === 'encroached').length}</div>
              <div className="text-muted">Encroached</div>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div>
          <h3 className="text-sm font-medium text-muted mb-2">Recent Complaints</h3>
          <div className="space-y-2">
            {complaints.slice(0, 4).map(complaint => (
              <div key={complaint.id} className="bg-bg rounded p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white">#{complaint.id.slice(-6)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    complaint.status === 'open' ? 'bg-danger/20 text-danger' :
                    complaint.status === 'in_review' ? 'bg-warning/20 text-warning' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="text-muted">{complaint.survey_no}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer
          center={[12.9675, 80.1491]}
          zoom={14}
          className="h-full"
          onclick={handleMapClick}
        >
          <TileLayer
            url={baseMapLayers[baseMap].url}
            attribution={baseMapLayers[baseMap].attribution}
          />
          
          {/* Test marker to verify map is working */}
          <Marker position={[12.9675, 80.1491]}>
            <Popup>
              Test Marker - Map is working!
            </Popup>
          </Marker>
          
          {layers.bhuvanWMS && (
            <TileLayer
              url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms"
              layers="india_cad"
              format="image/png"
              transparent={true}
              version="1.1.1"
              opacity={0.7}
              attribution="© ISRO Bhuvan"
            />
          )}

          {(() => {
            console.log('Layer state:', layers);
            console.log('Cadastral layer enabled:', layers.cadastral);
            console.log('Total parcels:', parcels.length, 'Filtered parcels:', filteredParcels.length);
            console.log('Search term:', searchTerm);
            return true; // Force render for debugging
          })() && (() => {
            console.log('Rendering cadastral layer, filtered parcels count:', filteredParcels.length);
            return filteredParcels.map((parcel, index) => {
              console.log(`Processing parcel ${index}:`, {
                id: parcel.id,
                survey_no: parcel.survey_no,
                sub_division: parcel.sub_division,
                land_type: parcel.land_type,
                geojson_coordinates: parcel.geojson_coordinates
              });
              
              let geojson;
              try {
                if (typeof parcel.geojson_coordinates === 'string') {
                  geojson = JSON.parse(parcel.geojson_coordinates);
                } else if (typeof parcel.geojson_coordinates === 'object') {
                  geojson = parcel.geojson_coordinates;
                } else {
                  console.error(`Invalid geojson type for parcel ${index}:`, typeof parcel.geojson_coordinates);
                  return null;
                }
                console.log(`Parsed geojson for parcel ${index}:`, geojson);
              } catch (error) {
                console.error(`Error parsing geojson for parcel ${index}:`, error);
                console.error(`Geojson data:`, parcel.geojson_coordinates);
                return null;
              }
              
              if (!geojson || !geojson.coordinates || !geojson.coordinates[0]) {
                console.error(`Invalid geojson for parcel ${index}:`, geojson);
                return null;
              }
              
              const positions = geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
              console.log(`Final positions for parcel ${index}:`, positions);
              
              return (
                <Polygon
                  key={parcel.id}
                  positions={positions}
                  pathOptions={{
                    fillColor: getParcelColor(parcel.land_type),
                    fillOpacity: 0.3,
                    color: getParcelBorderColor(parcel.status),
                    dashArray: getParcelBorderDash(parcel.status),
                    weight: getParcelBorderWeight(parcel.status)
                  }}
                  eventHandlers={{
                    click: () => handleParcelClick(parcel)
                  }}
                >
                  <div>{parcel.survey_no} | {parcel.village}, {parcel.taluk}</div>
                </Polygon>
              );
            });
          })()}

          {layers.ownership && parcels.map(parcel => (
            <CircleMarker
              key={`circle-${parcel.id}`}
              center={[parcel.centroid_lat, parcel.centroid_lng]}
              radius={6}
              pathOptions={{
                fillColor: getParcelColor(parcel.land_type),
                color: 'white',
                weight: 2,
                fillOpacity: 1
              }}
            />
          ))}

          <MapBounds parcels={parcels} />
        </MapContainer>

        {/* Coordinate Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-panel border border-border rounded-lg px-4 py-2">
          <span className="text-primary font-mono text-sm">
            Lat: {coordinates.lat}   Lng: {coordinates.lng}
          </span>
        </div>
      </div>

      {/* Right Panel */}
      {selectedParcel && (
        <div className="w-80 bg-panel border-l border-border p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selectedParcel.survey_no}</h2>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-muted hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              selectedParcel.status === 'clear' ? 'bg-primary/20 text-primary' :
              selectedParcel.status === 'encroached' ? 'bg-danger/20 text-danger' :
              selectedParcel.status === 'disputed' ? 'bg-warning/20 text-warning' :
              'bg-info/20 text-info'
            }`}>
              {selectedParcel.status}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Survey No:</span>
              <span className="text-white">{selectedParcel.survey_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Sub Division:</span>
              <span className="text-white">{selectedParcel.sub_division}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ULPIN:</span>
              <span className="text-white">{selectedParcel.ulpin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Village LGD Code:</span>
              <span className="text-white">{selectedParcel.village_lgd_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Patta No:</span>
              <span className="text-white">{selectedParcel.patta_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Owner Name:</span>
              <span className="text-white">{selectedParcel.owner_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Area:</span>
              <span className="text-white">{selectedParcel.area_acres} acres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">District:</span>
              <span className="text-white">{selectedParcel.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Taluk:</span>
              <span className="text-white">{selectedParcel.taluk}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Village:</span>
              <span className="text-white">{selectedParcel.village}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Land Type:</span>
              <span className="text-white">{selectedParcel.land_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status:</span>
              <span className="text-white">{selectedParcel.status}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-bg rounded">
            <div className="text-xs text-muted mb-1">Centroid Coordinates</div>
            <div className="text-primary font-mono text-xs">
              {selectedParcel.centroid_lat}, {selectedParcel.centroid_lng}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full py-2 bg-info text-white rounded hover:bg-info/90 transition-colors">
              Fly to Parcel
            </button>
            {selectedParcel.status === 'encroached' && (
              <button className="w-full py-2 bg-danger text-white rounded hover:bg-danger/90 transition-colors">
                Raise Alert
              </button>
            )}
            <button className="w-full py-2 bg-panel text-white border border-border rounded hover:bg-panel/90 transition-colors">
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
