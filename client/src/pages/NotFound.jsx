import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-muted mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
