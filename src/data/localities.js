// ============================================
// CivicPulse — Localities Data (Pune)
// ============================================

export const LOCALITIES = [
  {
    id: 'kothrud',
    name: 'Kothrud',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5074, lng: 73.8077 },
  },
  {
    id: 'karvenagar',
    name: 'Karvenagar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.4901, lng: 73.8183 },
  },
  {
    id: 'shivajinagar',
    name: 'Shivajinagar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5314, lng: 73.8446 },
  },
  {
    id: 'koregaonpark',
    name: 'Koregaon Park',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5362, lng: 73.8930 },
  },
  {
    id: 'viman_nagar',
    name: 'Viman Nagar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5665, lng: 73.9122 },
  },
  {
    id: 'hadapsar',
    name: 'Hadapsar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5089, lng: 73.9259 },
  },
  {
    id: 'baner',
    name: 'Baner',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5590, lng: 73.7868 },
  }
];

export function getLocalityById(id) {
  return LOCALITIES.find(l => l.id === id);
}

export function getAllLocalities() {
  return LOCALITIES;
}
