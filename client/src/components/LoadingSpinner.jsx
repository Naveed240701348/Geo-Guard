import React from 'react';

export default function LoadingSpinner({ size = 'medium', text = '', fullScreen = false }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-bg/80 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto`}></div>
        {text && (
          <p className="text-muted mt-4 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
}

// Skeleton Loader Component
export function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className="bg-bg/50 rounded animate-pulse"
          style={{
            height: `${Math.random() * 20 + 10}px`,
            width: `${Math.random() * 40 + 60}%`
          }}
        ></div>
      ))}
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-panel rounded-lg p-6 border border-border">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-bg/50 rounded w-3/4"></div>
        <div className="h-3 bg-bg/50 rounded w-1/2"></div>
        <div className="h-3 bg-bg/50 rounded w-5/6"></div>
        <div className="h-3 bg-bg/50 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-panel rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="text-left py-3 px-4">
                  <div className="h-4 bg-bg/50 rounded animate-pulse w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-3 px-4">
                    <div className="h-3 bg-bg/50 rounded animate-pulse w-16"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton({ width = 'w-20', height = 'h-10' }) {
  return (
    <div className={`${width} ${height} bg-bg/50 rounded animate-pulse`}></div>
  );
}
