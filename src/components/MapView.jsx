import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { getLocalityById } from '../data/localities';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon creator
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 14px;
        color: white;
      ">
        ${icon}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${color};
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

/**
 * MapView Component
 * Renders a Leaflet map with issues.
 */
export default function MapView({ issues, center = [18.5204, 73.8567], zoom = 12, onMarkerClick }) {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Safe Leaflet cleanup for React 19 StrictMode / Framer Motion transitions
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn('[MapView] Leaflet cleanup warning:', e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapUpdater center={center} />
        {/* Light theme CartoDB Positron tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {issues.map(issue => {
          let iconData = { color: '#0891b2', icon: '📍' };
          if (issue.category === 'pothole') iconData = { color: '#ef4444', icon: '🕳️' };
          else if (issue.category === 'streetlight') iconData = { color: '#f59e0b', icon: '💡' };
          else if (issue.category === 'water') iconData = { color: '#3b82f6', icon: '💧' };
          else if (issue.category === 'sanitation') iconData = { color: '#10b981', icon: '🗑️' };
          
          return (
            <Marker
              key={issue.id}
              position={[issue.location.lat, issue.location.lng]}
              icon={createCustomIcon(iconData.color, iconData.icon)}
              eventHandlers={{
                click: () => onMarkerClick ? onMarkerClick(issue.id) : null,
              }}
            >
              <Popup>
                <div style={{ padding: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{issue.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{issue.location.address}</div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/citizen/issue/${issue.id}`)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
