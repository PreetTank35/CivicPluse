import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Maximize2, Minimize2, MapPin, Sliders, Square, Circle, Shield, Sparkles, Navigation } from 'lucide-react';

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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        font-size: 16px;
        color: white;
        transition: transform 0.2s;
      ">
        ${icon}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 9px solid ${color};
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * MapSearchBar — Real-time geocoding search bar with cross-city & locality search.
 */
function MapSearchBar({ onLocationFound, issues, onFilterIssue }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  function handleSearch(value) {
    setQuery(value);
    if (onFilterIssue) onFilterIssue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      // First check matching local issues or localities
      const localMatches = (issues || []).filter(i => {
        const title = (i.title || '').toLowerCase();
        const locName = (i.location?.locality_name || i.location_address || i.locality_id || '').toLowerCase();
        return title.includes(value.toLowerCase()) || locName.includes(value.toLowerCase());
      }).slice(0, 3).map(i => ({
        name: `📍 Issue: ${i.title} (${i.location?.locality_name || i.location_address || i.locality_id || 'Pune'})`,
        lat: i.location_lat ?? i.location?.lat ?? 18.5204,
        lng: i.location_lng ?? i.location?.lng ?? 73.8567,
        isIssue: true,
        id: i.id
      }));

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await res.json();
        const geoResults = data.map(r => ({
          name: `🌍 ${r.display_name}`,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          isIssue: false
        }));
        setResults([...localMatches, ...geoResults]);
      } catch (e) {
        console.error('Geocoding error:', e);
        setResults(localMatches);
      }
      setIsSearching(false);
    }, 350);
  }

  return (
    <div className="map-search-container" style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      zIndex: 1000,
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '6px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
      }}>
        <Search size={18} style={{ color: 'var(--primary)', marginRight: '10px', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search any locality, city (e.g. Pune, Mumbai), or issue..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '14px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        />
        {isSearching && <div className="loading-spinner" style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
      </div>

      {results.length > 0 && (
        <div style={{
          marginTop: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          maxHeight: '280px',
          overflowY: 'auto',
        }}>
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => {
                onLocationFound([result.lat, result.lng], result.isIssue ? 16 : 14);
                setQuery(result.name.replace(/^[📍🌍]\s*/, '').split(',')[0]);
                setResults([]);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                borderBottom: idx < results.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '13px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>{result.name.charAt(0)}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {result.name.slice(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TILE_LAYERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: '🗺️ Standard Map',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    label: '🛰️ Real Satellite',
  },
  carto_street: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    label: '🛣️ Vibrant Street',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    label: '🌙 Night Mode',
  },
};

/**
 * MapView Component — Enhanced real map with search, layer switching, and size/shape customization.
 */
export default function MapView({ issues = [], center = [18.5204, 73.8567], zoom = 13, onMarkerClick, showCustomizer = true }) {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [tileLayer, setTileLayer] = useState('osm'); // Default to full colored OpenStreetMap
  const [showControls, setShowControls] = useState(false);
  
  // Customization state
  const [mapShape, setMapShape] = useState(() => localStorage.getItem('civicpulse_map_shape') || 'rectangle'); // rectangle | rounded | circle
  const [mapSize, setMapSize] = useState(() => localStorage.getItem('civicpulse_map_size') || 'full'); // small | medium | full
  const [customHeight, setCustomHeight] = useState(() => parseInt(localStorage.getItem('civicpulse_map_height') || '600', 10));

  useEffect(() => {
    if (center && center[0] && center[1]) {
      setMapCenter(center);
    }
  }, [center]);

  // Safe Leaflet cleanup for React 19 StrictMode
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

  function handleShapeChange(shape) {
    setMapShape(shape);
    localStorage.setItem('civicpulse_map_shape', shape);
  }

  function handleSizeChange(size) {
    setMapSize(size);
    localStorage.setItem('civicpulse_map_size', size);
  }

  const currentTile = TILE_LAYERS[tileLayer] || TILE_LAYERS.osm;

  // Compute container style based on customized shape & size
  const getHeight = () => {
    if (mapSize === 'small') return '380px';
    if (mapSize === 'medium') return '540px';
    if (mapSize === 'custom') return `${customHeight}px`;
    return '100%';
  };

  const getBorderRadius = () => {
    if (mapShape === 'rounded') return '28px';
    if (mapShape === 'circle') return '50%';
    return '12px';
  };

  return (
    <div className="map-outer-wrapper" style={{
      width: '100%',
      height: getHeight(),
      minHeight: mapSize === 'small' ? '380px' : '500px',
      position: 'relative',
      borderRadius: getBorderRadius(),
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      border: '1px solid var(--border)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: mapShape === 'circle' ? '1 / 1' : 'auto',
      maxHeight: mapShape === 'circle' ? '80vh' : 'none',
      margin: mapShape === 'circle' ? '0 auto' : '0',
    }}>
      {/* Search Bar */}
      <MapSearchBar
        issues={issues}
        onLocationFound={(coords, z) => {
          setMapCenter(coords);
          if (z) setMapZoom(z);
        }}
      />

      {/* Top Right Controls & Customization Overlay */}
      {showCustomizer && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}>
          {/* Toggle Controls Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Sliders size={15} style={{ color: 'var(--brand-orange)' }} />
            <span>Customize Map</span>
          </button>

          {/* Controls Menu */}
          {showControls && (
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px',
              width: '240px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fadeIn 0.2s ease-out',
            }}>
              {/* Map Layer */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Map Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                    <button
                      key={key}
                      onClick={() => setTileLayer(key)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${tileLayer === key ? 'var(--brand-orange)' : 'var(--border)'}`,
                        background: tileLayer === key ? 'rgba(255,107,43,0.12)' : 'transparent',
                        color: tileLayer === key ? 'var(--brand-orange)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Shape */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Map Shape
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'rectangle', label: 'Box', icon: Square },
                    { id: 'rounded', label: 'Rounded', icon: Shield },
                    { id: 'circle', label: 'Radar', icon: Circle },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleShapeChange(s.id)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${mapShape === s.id ? 'var(--brand-orange)' : 'var(--border)'}`,
                        background: mapShape === s.id ? 'rgba(255,107,43,0.12)' : 'transparent',
                        color: mapShape === s.id ? 'var(--brand-orange)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      <s.icon size={13} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Size */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Map Size
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'small', label: 'Small' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'full', label: 'Full' },
                  ].map(sz => (
                    <button
                      key={sz.id}
                      onClick={() => handleSizeChange(sz.id)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${mapSize === sz.id ? 'var(--brand-orange)' : 'var(--border)'}`,
                        background: mapSize === sz.id ? 'rgba(255,107,43,0.12)' : 'transparent',
                        color: mapSize === sz.id ? 'var(--brand-orange)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution={currentTile.attribution}
          url={currentTile.url}
        />

        {issues.map(issue => {
          const lat = issue.location_lat ?? issue.location?.lat;
          const lng = issue.location_lng ?? issue.location?.lng;
          if (lat === undefined || lng === undefined || lat === null || lng === null) return null;
          let iconData = { color: '#0891b2', icon: '📍' };
          if (issue.category === 'pothole') iconData = { color: '#ef4444', icon: '🕳️' };
          else if (issue.category === 'streetlight') iconData = { color: '#f59e0b', icon: '💡' };
          else if (issue.category === 'water' || issue.category === 'water_leakage') iconData = { color: '#3b82f6', icon: '💧' };
          else if (issue.category === 'sanitation' || issue.category === 'garbage') iconData = { color: '#10b981', icon: '🗑️' };
          else if (issue.category === 'traffic') iconData = { color: '#8b5cf6', icon: '🚦' };
          else if (issue.category === 'electricity') iconData = { color: '#f59e0b', icon: '⚡' };

          return (
            <Marker
              key={issue.id}
              position={[lat, lng]}
              icon={createCustomIcon(iconData.color, iconData.icon)}
              eventHandlers={{
                click: () => onMarkerClick ? onMarkerClick(issue.id) : null,
              }}
            >
              <Popup>
                <div style={{ padding: '6px', maxWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{iconData.icon}</span>
                    <strong style={{ fontSize: '13px', color: '#1e3a5f', lineHeight: 1.2 }}>{issue.title}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                    {issue.location?.address || issue.location?.locality_name || issue.location_address || 'Pune'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: issue.status === 'resolved' ? '#dcfce7' : '#fee2e2',
                      color: issue.status === 'resolved' ? '#166534' : '#991b1b',
                      textTransform: 'uppercase'
                    }}>
                      {issue.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#3b82f6' }}>
                      👍 {issue.votes || 0} votes
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/citizen/issue/${issue.id}`)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      background: '#ff6b2b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    View & Comment →
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
