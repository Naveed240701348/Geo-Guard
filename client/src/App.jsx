import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MapPage from './pages/MapPage';
import LandRecords from './pages/LandRecords';
import CSVImport from './pages/CSVImport';
import Complaints from './pages/Complaints';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <CitizenDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/map" element={
        <ProtectedRoute>
          <MapPage />
        </ProtectedRoute>
      } />
      
      <Route path="/land-records" element={
        <ProtectedRoute requiredRole="admin">
          <LandRecords />
        </ProtectedRoute>
      } />
      
      <Route path="/import" element={
        <ProtectedRoute requiredRole="admin">
          <CSVImport />
        </ProtectedRoute>
      } />
      
      <Route path="/complaints" element={
        <ProtectedRoute>
          <Complaints />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
