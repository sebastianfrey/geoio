import L from 'leaflet';

export function fromGeoJSON(geometry) {
  
  let { type, coordinates } = geometry;

  switch (type) {
    case "Point": {
      let center = L.latLng(coordinates[1], coordinates[0]);
      return { center };
    }

    case "MultiLineString": {
      let positions = coordinates.map(path => {
        return path.map(vertex => {
          return L.latLng(vertex[1], vertex[0]);
        });
      });
      return { positions };
    }

    case "Polygon": {
      let positions = coordinates.map(ring => {
        return ring.map(vertex => {
          return L.latLng(vertex[1], vertex[0]);
        });
      });
      return { positions };
    }

    default:
      return null;
  }
}