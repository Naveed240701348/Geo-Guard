import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function CSVImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    
    // Preview first 5 rows
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
    
    setPreview(rows);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await axios.post('/parcels/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please check your file format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `survey_no,sub_division,land_type,centroid_lat,centroid_lng,area_acres
1,1A,private,12.9721,80.1512,0.45
2,1B,private,12.9715,80.1498,0.30
5,2A,government,12.9698,80.1478,2.10`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'land_parcels_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/admin" className="text-muted hover:text-white mr-4">
            Back to Admin
          </Link>
          <h1 className="text-xl font-bold text-white">Import Land Parcels via CSV</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-panel rounded-lg p-6 mb-8 border border-border">
          <h2 className="text-2xl font-bold text-white mb-6">How to Fill CSV Data</h2>
          
          <div className="space-y-6">
            {/* Step 01 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-bg font-bold">01</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Get Coordinates</h3>
                <p className="text-muted mb-3">
                  Use Google Maps or Bhuvan to get precise coordinates for each land parcel.
                </p>
                <ol className="text-sm text-muted space-y-1 mb-3">
                  <li>1. Open Google Maps or bhunaksha.nic.in</li>
                  <li>2. Find the land parcel location</li>
                  <li>3. Right-click and copy the coordinates</li>
                  <li>4. Note the land type (private/government)</li>
                </ol>
                <a 
                  href="https://bhunaksha.nic.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-info hover:underline text-sm"
                >
                  Visit bhunaksha.nic.in
                </a>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-bg font-bold">02</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Fill CSV Data</h3>
                <p className="text-muted mb-3">
                  Fill the downloaded template with your land parcel information.
                </p>
                <ol className="text-sm text-muted space-y-1 mb-3">
                  <li>1. Download the CSV template</li>
                  <li>2. Fill in survey numbers and subdivision codes</li>
                  <li>3. Add coordinates and land types</li>
                  <li>4. Save as CSV file</li>
                </ol>
                <a 
                  href="https://bhunaksha.nic.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-info hover:underline text-sm"
                >
                  Visit bhunaksha.nic.in
                </a>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-bg font-bold">03</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Fill CSV & Upload</h3>
                <p className="text-muted mb-3">
                  Download our template, fill in your data, and upload it here.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-warning text-bg rounded-lg hover:bg-warning/90 transition-colors text-sm"
                >
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column Reference */}
        <div className="bg-panel rounded-lg p-6 mb-8 border border-border">
          <h3 className="text-lg font-semibold text-white mb-4">Column Reference</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">survey_no</span>
                <span className="text-primary">required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">sub_division</span>
                <span className="text-primary">required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">land_type</span>
                <span className="text-primary">required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">centroid_lat</span>
                <span className="text-primary">required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">centroid_lng</span>
                <span className="text-primary">required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">area_acres</span>
                <span className="text-muted">optional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-panel rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-white mb-4">Upload CSV File</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/10' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <svg className="w-12 h-12 text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-white mb-2">
              {file ? file.name : 'Drag and drop your CSV file here, or click to browse'}
            </p>
            
            {file && (
              <p className="text-sm text-muted mb-4">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            
            <label
              htmlFor="csv-upload"
              className="inline-block px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Choose File
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-muted mb-2">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="text-left py-2 px-2 text-muted font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b border-border">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-2 px-2 text-white max-w-xs truncate">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing CSV & Mapping Parcels...' : 'Upload CSV'}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-panel rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-white mb-4">Import Results</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-bg rounded p-4 text-center">
                <div className="text-2xl font-bold text-white">{result.total}</div>
                <div className="text-sm text-muted">Total Rows</div>
              </div>
              <div className="bg-bg rounded p-4 text-center">
                <div className="text-2xl font-bold text-primary">{result.imported}</div>
                <div className="text-sm text-muted">Imported</div>
              </div>
              <div className="bg-bg rounded p-4 text-center">
                <div className="text-2xl font-bold text-info">{result.updated}</div>
                <div className="text-sm text-muted">Updated</div>
              </div>
              <div className="bg-bg rounded p-4 text-center">
                <div className="text-2xl font-bold text-warning">{result.skipped}</div>
                <div className="text-sm text-muted">Skipped</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted mb-2">Skipped Rows (Errors)</h4>
                <div className="bg-bg rounded p-4 max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-danger mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              to="/map"
              className="inline-block px-6 py-3 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
            >
              View All Parcels on Map
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
