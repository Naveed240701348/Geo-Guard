function generatePolygonFromCentroid(lat, lng, areaAcres = 1) {
  const offset = Math.sqrt(areaAcres) * 0.0015;
  return {
    type: 'Polygon',
    coordinates: [[
      [lng - offset, lat - offset],
      [lng + offset, lat - offset],
      [lng + offset, lat + offset],
      [lng - offset, lat + offset],
      [lng - offset, lat - offset]
    ]]
  };
}

module.exports = { generatePolygonFromCentroid };
