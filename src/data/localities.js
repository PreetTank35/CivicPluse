// ============================================
// CivicPulse — Localities Data (Pune)
// ============================================

export const LOCALITIES = [
  {
    id: 'kothrud',
    name: 'Kothrud',
    ward_number: 'Ward 12',
    city: 'Pune',
    pincode: '411038',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5074, lng: 73.8077 },
  },
  {
    id: 'karvenagar',
    name: 'Karvenagar',
    ward_number: 'Ward 11',
    city: 'Pune',
    pincode: '411052',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.4901, lng: 73.8183 },
  },
  {
    id: 'shivajinagar',
    name: 'Shivajinagar',
    ward_number: 'Ward 5',
    city: 'Pune',
    pincode: '411005',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5314, lng: 73.8446 },
  },
  {
    id: 'koregaonpark',
    name: 'Koregaon Park',
    ward_number: 'Ward 14',
    city: 'Pune',
    pincode: '411001',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5362, lng: 73.8930 },
  },
  {
    id: 'viman_nagar',
    name: 'Viman Nagar',
    ward_number: 'Ward 17',
    city: 'Pune',
    pincode: '411014',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5665, lng: 73.9122 },
  },
  {
    id: 'hadapsar',
    name: 'Hadapsar',
    ward_number: 'Ward 22',
    city: 'Pune',
    pincode: '411028',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5089, lng: 73.9259 },
  },
  {
    id: 'baner',
    name: 'Baner',
    ward_number: 'Ward 8',
    city: 'Pune',
    pincode: '411045',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5590, lng: 73.7868 },
  },
  {
    id: 'aundh',
    name: 'Aundh',
    ward_number: 'Ward 7',
    city: 'Pune',
    pincode: '411007',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5583, lng: 73.8073 },
  },
  {
    id: 'deccan',
    name: 'Deccan Gymkhana',
    ward_number: 'Ward 6',
    city: 'Pune',
    pincode: '411004',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5196, lng: 73.8403 },
  },
  {
    id: 'pimpri',
    name: 'Pimpri-Chinchwad',
    ward_number: 'Ward 30',
    city: 'Pune',
    pincode: '411018',
    district: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.6298, lng: 73.7997 },
  },
];

export function getLocalityById(id) {
  return LOCALITIES.find(l => l.id === id);
}

export function getAllLocalities() {
  return LOCALITIES;
}

export function getNearestLocality(lat, lng) {
  let nearest = LOCALITIES[0];
  let minDist = Infinity;
  for (const loc of LOCALITIES) {
    const dist = Math.sqrt(
      Math.pow(loc.center.lat - lat, 2) + Math.pow(loc.center.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  }
  return nearest;
}
