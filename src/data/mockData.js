// ============================================
// CivicPulse — Mock Data (Pune)
// ============================================

import { LOCALITIES } from './localities';

// ── Categories ──
export const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', color: '#ef4444' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️', color: '#f97316' },
  { id: 'water_leakage', label: 'Water Leakage', icon: '💧', color: '#3b82f6' },
  { id: 'electricity', label: 'Electricity', icon: '⚡', color: '#eab308' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡', color: '#f59e0b' },
  { id: 'safety', label: 'Safety', icon: '🚨', color: '#dc2626' },
  { id: 'drainage', label: 'Drainage', icon: '🌊', color: '#06b6d4' },
  { id: 'stray_animals', label: 'Stray Animals', icon: '🐕', color: '#8b5cf6' },
  { id: 'other', label: 'Other', icon: '📋', color: '#6b7280' },
];

// ── Status definitions ──
export const STATUSES = [
  { id: 'reported', label: 'Reported', color: '#ef4444' },
  { id: 'verified', label: 'Verified', color: '#f59e0b' },
  { id: 'escalated', label: 'Escalated', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1' },
  { id: 'resolved', label: 'Resolved', color: '#10b981' },
  { id: 'rejected', label: 'Rejected', color: '#6b7280' },
];

export const STATUS_ORDER = ['reported', 'verified', 'escalated', 'in_progress', 'resolved'];

// ── Departments ──
export const DEPARTMENTS = [
  {
    id: 'dept-pw',
    name: 'Public Works Department',
    category: 'pothole',
    contact_email: 'pwd@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-swd',
    name: 'Solid Waste Management',
    category: 'garbage',
    contact_email: 'swm@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-water',
    name: 'Water Supply Department',
    category: 'water_leakage',
    contact_email: 'water@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-elec',
    name: 'MSEDCL (Electricity)',
    category: 'electricity',
    contact_email: 'msedcl@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-street',
    name: 'Street Lighting Division',
    category: 'streetlight',
    contact_email: 'streetlight@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-safety',
    name: 'Pune Police / Safety Cell',
    category: 'safety',
    contact_email: 'safety@punepolice.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-drain',
    name: 'Drainage & Sewage',
    category: 'drainage',
    contact_email: 'drainage@pune.gov.in',
    webhook_url: null,
  },
  {
    id: 'dept-animal',
    name: 'Animal Husbandry',
    category: 'stray_animals',
    contact_email: 'animals@pune.gov.in',
    webhook_url: null,
  },
];

// ── SLA Configuration ──
export const SLA_CONFIGS = [
  { category: 'pothole', hours: 72 },
  { category: 'garbage', hours: 48 },
  { category: 'water_leakage', hours: 24 },
  { category: 'electricity', hours: 12 },
  { category: 'streetlight', hours: 48 },
  { category: 'safety', hours: 6 },
  { category: 'drainage', hours: 24 },
  { category: 'stray_animals', hours: 72 },
  { category: 'other', hours: 96 },
];

// ── Users ──
export const USERS = [
  { id: 'user-1', name: 'Aarav Mehta', email: 'aarav@email.com', role: 'citizen', locality_id: 'kothrud', avatar: 'AM', impact_score: 450 },
  { id: 'user-2', name: 'Diya Nair', email: 'diya@email.com', role: 'citizen', locality_id: 'karvenagar', avatar: 'DN', impact_score: 320 },
  { id: 'user-3', name: 'Kabir Joshi', email: 'kabir@email.com', role: 'citizen', locality_id: 'shivajinagar', avatar: 'KJ', impact_score: 280 },
  { id: 'user-4', name: 'Ananya Reddy', email: 'ananya@email.com', role: 'citizen', locality_id: 'koregaonpark', avatar: 'AR', impact_score: 190 },
  { id: 'user-5', name: 'Rohan Iyer', email: 'rohan@email.com', role: 'citizen', locality_id: 'viman_nagar', avatar: 'RI', impact_score: 1110 },
  { id: 'user-6', name: 'Meera Gupta', email: 'meera@email.com', role: 'citizen', locality_id: 'baner', avatar: 'MG', impact_score: 150 },
  { id: 'user-7', name: 'Priya Sharma', email: 'priya@email.com', role: 'citizen', locality_id: 'aundh', avatar: 'PS', impact_score: 560 },
  { id: 'user-8', name: 'Vikram Singh', email: 'vikram@email.com', role: 'citizen', locality_id: 'deccan', avatar: 'VS', impact_score: 230 },
  { id: 'user-mod-1', name: 'Arjun Menon', email: 'arjun@civicpulse.app', role: 'moderator', locality_id: 'kothrud', assigned_locality_id: 'kothrud', avatar: 'AM', impact_score: 0 },
  { id: 'user-mod-2', name: 'Sneha Kulkarni', email: 'sneha@civicpulse.app', role: 'moderator', locality_id: 'karvenagar', assigned_locality_id: 'karvenagar', avatar: 'SK', impact_score: 0 },
  { id: 'user-admin', name: 'Commissioner Singh', email: 'admin@civicpulse.app', role: 'super_admin', locality_id: null, assigned_locality_id: null, avatar: 'CS', impact_score: 0 },
];

// ── Gamification ──
export const LEVELS = [
  { level: 1, minScore: 0, title: 'Observer', name: 'Observer', icon: '🌱' },
  { level: 2, minScore: 50, title: 'Contributor', name: 'Contributor', icon: '🔍' },
  { level: 3, minScore: 150, title: 'Advocate', name: 'Advocate', icon: '📢' },
  { level: 4, minScore: 300, title: 'Champion', name: 'Champion', icon: '🏆' },
  { level: 5, minScore: 500, title: 'Civic Guardian', name: 'Civic Guardian', icon: '🛡️' },
];

// ── Helpers ──
function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

// ── Seed Problems ──
// Using placeholder image URLs (Unsplash) for realistic demo
const PROBLEM_IMAGES = {
  pothole: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop',
  garbage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop',
  water_leakage: 'https://images.unsplash.com/photo-1585687433680-e2a26b8e7a2e?w=600&h=400&fit=crop',
  electricity: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
  streetlight: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&h=400&fit=crop',
  safety: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&h=400&fit=crop',
  drainage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop',
  stray_animals: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=600&h=400&fit=crop',
};

export const SEED_PROBLEMS = [
  {
    id: 'prob-1',
    user_id: 'user-1',
    title: 'Large pothole near Paud Road signal',
    description: 'A dangerous 2-foot deep pothole has formed right at the Paud Road signal junction. Multiple two-wheelers have skidded here in the past week. The pothole fills with water during rain making it invisible to drivers.',
    category: 'pothole',
    media_urls: [PROBLEM_IMAGES.pothole],
    location_lat: 18.5074,
    location_lng: 73.8077,
    location_address: 'Paud Road Signal, near MIT College',
    locality_id: 'kothrud',
    status: 'verified',
    support_count: 23,
    comment_count: 5,
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
  {
    id: 'prob-2',
    user_id: 'user-2',
    title: 'Garbage pile-up near Karvenagar bus stop',
    description: 'The garbage collection has not happened for 4 days straight. The pile is attracting stray dogs and the smell is unbearable for nearby residents and shop owners.',
    category: 'garbage',
    media_urls: [PROBLEM_IMAGES.garbage],
    location_lat: 18.4918,
    location_lng: 73.8205,
    location_address: 'Karvenagar Bus Stop, Main Road',
    locality_id: 'karvenagar',
    status: 'reported',
    support_count: 15,
    comment_count: 3,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
  {
    id: 'prob-3',
    user_id: 'user-3',
    title: 'Water main leak flooding FC Road',
    description: 'A major water pipeline has burst near Ferguson College causing water to flood the footpath and road. Pedestrians are forced to walk on the road creating a safety hazard.',
    category: 'water_leakage',
    media_urls: [PROBLEM_IMAGES.water_leakage],
    location_lat: 18.5280,
    location_lng: 73.8410,
    location_address: 'FC Road, near Good Luck Chowk',
    locality_id: 'shivajinagar',
    status: 'escalated',
    support_count: 42,
    comment_count: 12,
    created_at: daysAgo(5),
    updated_at: hoursAgo(8),
  },
  {
    id: 'prob-4',
    user_id: 'user-4',
    title: 'Broken streetlights on Lane 6',
    description: 'Three consecutive streetlights on Lane 6 have been non-functional for over 2 weeks. The area becomes extremely dark after 7 PM creating safety concerns, especially for women and elderly residents.',
    category: 'streetlight',
    media_urls: [PROBLEM_IMAGES.streetlight],
    location_lat: 18.5355,
    location_lng: 73.8925,
    location_address: 'Lane 6, Koregaon Park',
    locality_id: 'koregaonpark',
    status: 'in_progress',
    support_count: 18,
    comment_count: 4,
    created_at: daysAgo(14),
    updated_at: daysAgo(2),
  },
  {
    id: 'prob-5',
    user_id: 'user-5',
    title: 'Open manhole near Phoenix Mall',
    description: 'A manhole cover is missing near the Phoenix Mall entrance road. This is extremely dangerous especially at night. Someone has placed a few stones around it but it is not properly barricaded.',
    category: 'safety',
    media_urls: [PROBLEM_IMAGES.safety],
    location_lat: 18.5620,
    location_lng: 73.9150,
    location_address: 'Near Phoenix Marketcity, Nagar Road',
    locality_id: 'viman_nagar',
    status: 'reported',
    support_count: 31,
    comment_count: 8,
    created_at: hoursAgo(18),
    updated_at: hoursAgo(18),
  },
  {
    id: 'prob-6',
    user_id: 'user-6',
    title: 'Drainage overflow in Baner Gaothan',
    description: 'The drainage system near the old village area is completely blocked causing sewage overflow on the main road. The stench is terrible and it is a health hazard for the entire neighborhood.',
    category: 'drainage',
    media_urls: [PROBLEM_IMAGES.drainage],
    location_lat: 18.5588,
    location_lng: 73.7850,
    location_address: 'Baner Gaothan, near Pancard Club',
    locality_id: 'baner',
    status: 'reported',
    support_count: 9,
    comment_count: 2,
    created_at: hoursAgo(36),
    updated_at: hoursAgo(36),
  },
  {
    id: 'prob-7',
    user_id: 'user-7',
    title: 'Stray dog pack near Aundh IT Park',
    description: 'A pack of 8-10 stray dogs has become very aggressive near the IT Park gate. They chase pedestrians and cyclists, especially in the evening hours. Multiple bite incidents reported.',
    category: 'stray_animals',
    media_urls: [PROBLEM_IMAGES.stray_animals],
    location_lat: 18.5590,
    location_lng: 73.8080,
    location_address: 'Aundh IT Park, Main Gate',
    locality_id: 'aundh',
    status: 'verified',
    support_count: 27,
    comment_count: 9,
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
  },
  {
    id: 'prob-8',
    user_id: 'user-8',
    title: 'Frequent power cuts in Deccan area',
    description: 'The Deccan area has been experiencing 3-4 hour power cuts daily for the past week. No prior notice is given by MSEDCL. This is disrupting work-from-home professionals and small businesses.',
    category: 'electricity',
    media_urls: [PROBLEM_IMAGES.electricity],
    location_lat: 18.5190,
    location_lng: 73.8395,
    location_address: 'Deccan Gymkhana, near Garware Bridge',
    locality_id: 'deccan',
    status: 'escalated',
    support_count: 56,
    comment_count: 15,
    created_at: daysAgo(7),
    updated_at: daysAgo(1),
  },
  {
    id: 'prob-9',
    user_id: 'user-1',
    title: 'Garbage dumped in Kothrud park',
    description: 'Someone has been illegally dumping construction debris and household waste inside the community park. The children\'s play area is affected. This has been happening for over a week.',
    category: 'garbage',
    media_urls: [PROBLEM_IMAGES.garbage],
    location_lat: 18.5050,
    location_lng: 73.8100,
    location_address: 'Community Park, Kothrud',
    locality_id: 'kothrud',
    status: 'reported',
    support_count: 12,
    comment_count: 3,
    created_at: hoursAgo(6),
    updated_at: hoursAgo(6),
  },
  {
    id: 'prob-10',
    user_id: 'user-5',
    title: 'Water contamination in Viman Nagar',
    description: 'The tap water in Sector 3 has turned yellowish-brown and has a foul smell. Multiple families are falling sick. We suspect sewage mixing with the water supply line.',
    category: 'water_leakage',
    media_urls: [PROBLEM_IMAGES.water_leakage],
    location_lat: 18.5680,
    location_lng: 73.9100,
    location_address: 'Sector 3, Viman Nagar',
    locality_id: 'viman_nagar',
    status: 'verified',
    support_count: 38,
    comment_count: 11,
    created_at: daysAgo(2),
    updated_at: hoursAgo(12),
  },
  {
    id: 'prob-11',
    user_id: 'user-3',
    title: 'Pothole cluster on JM Road',
    description: 'A series of 5-6 potholes have formed on JM Road between Goodluck Chowk and PMC office. The road surface has completely deteriorated after recent rains.',
    category: 'pothole',
    media_urls: [PROBLEM_IMAGES.pothole],
    location_lat: 18.5250,
    location_lng: 73.8430,
    location_address: 'JM Road, Shivajinagar',
    locality_id: 'shivajinagar',
    status: 'reported',
    support_count: 19,
    comment_count: 4,
    created_at: hoursAgo(48),
    updated_at: hoursAgo(48),
  },
  {
    id: 'prob-12',
    user_id: 'user-2',
    title: 'Broken footpath tiles near school',
    description: 'The footpath tiles near Karvenagar Primary School are broken and uneven. Children have been tripping and falling. A girl fractured her wrist last week because of this.',
    category: 'safety',
    media_urls: [PROBLEM_IMAGES.safety],
    location_lat: 18.4890,
    location_lng: 73.8195,
    location_address: 'Near Karvenagar Primary School',
    locality_id: 'karvenagar',
    status: 'resolved',
    support_count: 35,
    comment_count: 7,
    created_at: daysAgo(20),
    updated_at: daysAgo(3),
  },
];

// ── Pre-seed support data (who supports which problems) ──
export const SEED_SUPPORT = [
  { problem_id: 'prob-1', user_id: 'user-1' },
  { problem_id: 'prob-1', user_id: 'user-2' },
  { problem_id: 'prob-1', user_id: 'user-3' },
  { problem_id: 'prob-2', user_id: 'user-2' },
  { problem_id: 'prob-2', user_id: 'user-4' },
  { problem_id: 'prob-3', user_id: 'user-1' },
  { problem_id: 'prob-3', user_id: 'user-3' },
  { problem_id: 'prob-3', user_id: 'user-5' },
  { problem_id: 'prob-3', user_id: 'user-7' },
  { problem_id: 'prob-5', user_id: 'user-5' },
  { problem_id: 'prob-5', user_id: 'user-1' },
  { problem_id: 'prob-8', user_id: 'user-8' },
  { problem_id: 'prob-8', user_id: 'user-3' },
  { problem_id: 'prob-8', user_id: 'user-5' },
];

// ── Seed comments ──
export const SEED_COMMENTS = [
  { id: 'cmt-1', problem_id: 'prob-1', user_id: 'user-2', text: 'I also nearly fell here yesterday. This is getting dangerous!', created_at: daysAgo(2) },
  { id: 'cmt-2', problem_id: 'prob-1', user_id: 'user-3', text: 'The pothole has gotten bigger after last night\'s rain.', created_at: daysAgo(1) },
  { id: 'cmt-3', problem_id: 'prob-3', user_id: 'user-1', text: 'The water has been running for 3 days now. Complete waste!', created_at: daysAgo(4) },
  { id: 'cmt-4', problem_id: 'prob-3', user_id: 'user-7', text: 'PMC was called but no one showed up. Typical.', created_at: daysAgo(3) },
  { id: 'cmt-5', problem_id: 'prob-5', user_id: 'user-1', text: 'I put a branch near it as a warning but someone moved it. Very dangerous at night.', created_at: hoursAgo(12) },
  { id: 'cmt-6', problem_id: 'prob-8', user_id: 'user-7', text: 'This is affecting my freelance work badly. Need stable power!', created_at: daysAgo(5) },
];

// ── Seed status history ──
export const SEED_STATUS_HISTORY = [
  { problem_id: 'prob-1', old_status: 'reported', new_status: 'verified', changed_by: 'user-mod-1', note: 'Verified by locality moderator. Confirmed dangerous.', created_at: daysAgo(2) },
  { problem_id: 'prob-3', old_status: 'reported', new_status: 'verified', changed_by: 'user-mod-2', note: 'Major pipeline burst confirmed.', created_at: daysAgo(4) },
  { problem_id: 'prob-3', old_status: 'verified', new_status: 'escalated', changed_by: 'user-admin', note: 'Escalated to Water Supply Department. High priority.', created_at: daysAgo(3) },
  { problem_id: 'prob-4', old_status: 'reported', new_status: 'verified', changed_by: 'user-admin', note: 'Verified. 3 lights confirmed non-functional.', created_at: daysAgo(10) },
  { problem_id: 'prob-4', old_status: 'verified', new_status: 'escalated', changed_by: 'user-admin', note: 'Sent to Street Lighting Division.', created_at: daysAgo(8) },
  { problem_id: 'prob-4', old_status: 'escalated', new_status: 'in_progress', changed_by: 'user-admin', note: 'Department acknowledged. Repair crew scheduled.', created_at: daysAgo(2) },
  { problem_id: 'prob-8', old_status: 'reported', new_status: 'verified', changed_by: 'user-admin', note: 'Confirmed widespread power cuts.', created_at: daysAgo(5) },
  { problem_id: 'prob-8', old_status: 'verified', new_status: 'escalated', changed_by: 'user-admin', note: 'Escalated to MSEDCL. 56 supports — high public concern.', created_at: daysAgo(3) },
  { problem_id: 'prob-12', old_status: 'reported', new_status: 'verified', changed_by: 'user-mod-2', note: 'Child injury confirmed. Urgent repair needed.', created_at: daysAgo(18) },
  { problem_id: 'prob-12', old_status: 'verified', new_status: 'in_progress', changed_by: 'user-admin', note: 'Repair crew dispatched.', created_at: daysAgo(10) },
  { problem_id: 'prob-12', old_status: 'in_progress', new_status: 'resolved', changed_by: 'user-admin', note: 'Footpath tiles replaced. Verified by moderator.', created_at: daysAgo(3) },
];

// ── Trend data for charts ──
export const MONTHLY_TRENDS = [
  { month: 'Jan', reported: 45, resolved: 32 },
  { month: 'Feb', reported: 52, resolved: 41 },
  { month: 'Mar', reported: 61, resolved: 48 },
  { month: 'Apr', reported: 58, resolved: 55 },
  { month: 'May', reported: 72, resolved: 60 },
  { month: 'Jun', reported: 68, resolved: 58 },
];

export const DEPT_PERFORMANCE = [
  { name: 'Public Works', avgHours: 48, slaBreachRate: 22, totalIssues: 312, resolved: 245 },
  { name: 'Water Supply', avgHours: 18, slaBreachRate: 12, totalIssues: 156, resolved: 138 },
  { name: 'Solid Waste', avgHours: 36, slaBreachRate: 18, totalIssues: 97, resolved: 80 },
  { name: 'MSEDCL', avgHours: 8, slaBreachRate: 8, totalIssues: 134, resolved: 128 },
  { name: 'Street Lights', avgHours: 72, slaBreachRate: 28, totalIssues: 89, resolved: 62 },
  { name: 'Safety Cell', avgHours: 4, slaBreachRate: 5, totalIssues: 45, resolved: 42 },
];

// Config
export const SUPPORT_THRESHOLD = 15; // auto-escalation threshold
export const MAX_DAILY_POSTS = 10;
export const MAX_FLAGS_TO_HIDE = 5;



export const BADGES_CATALOG = [
  { id: 'first_report', label: 'First Report', icon: '🎯', desc: 'Reported your first civic problem' },
  { id: 'supporter_10', label: 'Supportive Citizen', icon: '🤝', desc: 'Supported 10 problems across your locality' },
  { id: 'escalator', label: 'Escalation Catalyst', icon: '⚡', desc: 'Reported a problem that reached government escalation' },
  { id: 'resolved_5', label: 'Problem Solver', icon: '✅', desc: 'Had 5 reported problems verified and resolved' },
  { id: 'top_reporter', label: 'Top Reporter', icon: '🌟', desc: 'Among the top 10% most active citizens in Pune' },
];

export const SEVERITIES = [
  { id: 'critical', label: 'Critical / Emergency', color: 'var(--danger)' },
  { id: 'high', label: 'High Priority', color: 'var(--warning)' },
  { id: 'medium', label: 'Medium Priority', color: 'var(--accent)' },
  { id: 'low', label: 'Low / Routine', color: 'var(--success)' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'c1', title: 'Ward Watcher', desc: 'Report 3 issues in your ward', progress: 2, total: 3, reward: '100 pts' },
  { id: 'c2', title: 'Community Catalyst', desc: 'Support 5 open community problems', progress: 5, total: 5, reward: '150 pts' },
  { id: 'c3', title: 'Speed Verifier', desc: 'Verify 2 resolved issues', progress: 1, total: 2, reward: '200 pts' },
];



