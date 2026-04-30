function generatePolygonFromCentroid(lat, lng, areaAcres = 1) {
  // Much smaller, more realistic parcel sizes
  // 1 acre = ~43,560 sq ft = ~0.004 km²
  // In degrees: 1 degree latitude ~ 111 km, so 1 acre ~ 0.0018 degrees
  const offset = Math.sqrt(areaAcres) * 0.0004; // Much smaller - about 40m per side
  
  // Create irregular, more natural-looking parcels
  const points = [];
  const numPoints = 5; // Pentagon shape for more natural look
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const radius = offset * (0.8 + Math.random() * 0.4); // Random radius variation
    const pointLat = lat + radius * Math.sin(angle);
    const pointLng = lng + radius * Math.cos(angle);
    points.push([pointLng, pointLat]);
  }
  
  // Close the polygon
  points.push(points[0]);
  
  return {
    type: 'Polygon',
    coordinates: [points]
  };
}

// Function to check if two polygons overlap (simplified)
function checkPolygonOverlap(poly1, poly2) {
  // Simple distance check between centroids
  const center1 = getPolygonCenter(poly1);
  const center2 = getPolygonCenter(poly2);
  
  const distance = Math.sqrt(
    Math.pow(center1.lat - center2.lat, 2) + 
    Math.pow(center1.lng - center2.lng, 2)
  );
  
  // If centroids are closer than 0.0005 degrees (~55m), consider them overlapping
  return distance < 0.0005;
}

function getPolygonCenter(polygon) {
  if (!polygon.coordinates || !polygon.coordinates[0] || polygon.coordinates[0].length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  const coords = polygon.coordinates[0];
  let sumLat = 0, sumLng = 0;
  
  coords.forEach(coord => {
    sumLng += coord[0];
    sumLat += coord[1];
  });
  
  return {
    lat: sumLat / coords.length,
    lng: sumLng / coords.length
  };
}

module.exports = { generatePolygonFromCentroid };
