// ============================================
// CivicPulse — Mock Data (Pune)
// ============================================

import { LOCALITIES } from './localities';

export const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', color: '#ef4444' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡', color: '#f59e0b' },
  { id: 'water', label: 'Water Supply', icon: '💧', color: '#3b82f6' },
  { id: 'sanitation', label: 'Sanitation', icon: '🗑️', color: '#10b981' },
  { id: 'parks', label: 'Parks & Green', icon: '🌳', color: '#22c55e' },
  { id: 'traffic', label: 'Traffic', icon: '🚦', color: '#f97316' },
  { id: 'noise', label: 'Noise', icon: '🔊', color: '#8b5cf6' },
  { id: 'drainage', label: 'Drainage', icon: '🌊', color: '#06b6d4' },
];

export const STATUSES = [
  { id: 'open', label: 'Open', color: '#f59e0b' },
  { id: 'acknowledged', label: 'Acknowledged', color: '#8b5cf6' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'resolved', label: 'Resolved', color: '#10b981' },
  { id: 'verified', label: 'Verified', color: '#34d399' },
  { id: 'escalated', label: 'Escalated', color: '#ef4444' },
];

export const SEVERITIES = [
  { id: 'low', label: 'Low', color: '#10b981' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#f87171' },
  { id: 'critical', label: 'Critical', color: '#ef4444' },
];

export const DEPARTMENTS = [
  { id: 'dept-pw', name: 'Public Works', head: 'Rajesh Kumar', email: 'pw@pune.gov', categories: ['pothole', 'streetlight', 'drainage'] },
  { id: 'dept-util', name: 'Utilities', head: 'Priya Sharma', email: 'util@pune.gov', categories: ['water'] },
  { id: 'dept-parks', name: 'Parks & Recreation', head: 'Amit Patel', email: 'parks@pune.gov', categories: ['parks'] },
  { id: 'dept-traffic', name: 'Traffic Management', head: 'Sunita Desai', email: 'traffic@pune.gov', categories: ['traffic'] },
  { id: 'dept-sanit', name: 'Sanitation', head: 'Vikram Singh', email: 'sanitation@pune.gov', categories: ['sanitation', 'noise'] },
];

export const SLA_CONFIGS = [
  { category: 'pothole', severity: 'critical', hours: 24, label: '24 hours' },
  { category: 'pothole', severity: 'high', hours: 48, label: '48 hours' },
  { category: 'pothole', severity: 'medium', hours: 72, label: '72 hours' },
  { category: 'pothole', severity: 'low', hours: 168, label: '7 days' },
  { category: 'streetlight', severity: 'high', hours: 24, label: '24 hours' },
  { category: 'streetlight', severity: 'medium', hours: 48, label: '48 hours' },
  { category: 'water', severity: 'critical', hours: 6, label: '6 hours' },
  { category: 'water', severity: 'high', hours: 12, label: '12 hours' },
  { category: 'water', severity: 'medium', hours: 24, label: '24 hours' },
  { category: 'sanitation', severity: 'high', hours: 24, label: '24 hours' },
  { category: 'sanitation', severity: 'medium', hours: 48, label: '48 hours' },
  { category: 'traffic', severity: 'critical', hours: 4, label: '4 hours' },
  { category: 'traffic', severity: 'high', hours: 12, label: '12 hours' },
  { category: 'drainage', severity: 'critical', hours: 6, label: '6 hours' },
  { category: 'drainage', severity: 'high', hours: 24, label: '24 hours' },
  { category: 'parks', severity: 'medium', hours: 168, label: '7 days' },
  { category: 'noise', severity: 'medium', hours: 72, label: '72 hours' },
];

export const LEVELS = [
  { level: 1, minScore: 0, title: 'Newcomer', icon: '🌱' },
  { level: 2, minScore: 100, title: 'Observer', icon: '👀' },
  { level: 3, minScore: 300, title: 'Contributor', icon: '⭐' },
  { level: 4, minScore: 600, title: 'Guardian', icon: '🛡️' },
  { level: 5, minScore: 1000, title: 'Champion', icon: '🏆' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'w1', title: 'Report 3 Issues', target: 3, progress: 2, points: 50 },
  { id: 'w2', title: 'Vote on 10 Issues', target: 10, progress: 10, points: 30, completed: true },
  { id: 'w3', title: 'Verify 2 Resolutions', target: 2, progress: 0, points: 40 },
];

export const USERS = [
  { id: 'user-1', name: 'Aarav Mehta', email: 'aarav@email.com', role: 'citizen', locality: 'kothrud', avatar: 'AM', points: 450, badges: ['first-report', 'watchdog', 'verifier'], streak: 3 },
  { id: 'user-2', name: 'Diya Nair', email: 'diya@email.com', role: 'citizen', locality: 'karvenagar', avatar: 'DN', points: 320, badges: ['first-report', 'community-hero'], streak: 1 },
  { id: 'user-3', name: 'Kabir Joshi', email: 'kabir@email.com', role: 'citizen', locality: 'shivajinagar', avatar: 'KJ', points: 280, badges: ['first-report'], streak: 0 },
  { id: 'user-4', name: 'Ananya Reddy', email: 'ananya@email.com', role: 'citizen', locality: 'koregaonpark', avatar: 'AR', points: 190, badges: ['first-report', 'verifier'], streak: 5 },
  { id: 'user-5', name: 'Rohan Iyer', email: 'rohan@email.com', role: 'citizen', locality: 'viman_nagar', avatar: 'RI', points: 1110, badges: ['first-report', 'watchdog', 'community-hero', 'verifier'], streak: 12 },
  { id: 'user-6', name: 'Meera Gupta', email: 'meera@email.com', role: 'citizen', locality: 'baner', avatar: 'MG', points: 150, badges: ['first-report'], streak: 2 },
  { id: 'user-7', name: 'Arjun Menon', email: 'arjun@sub.gov', role: 'sub_admin', locality: 'kothrud', department: 'dept-pw', avatar: 'AM', points: 0, badges: [], streak: 0 },
  { id: 'user-8', name: 'Sneha Kulkarni', email: 'sneha@sub.gov', role: 'sub_admin', locality: 'karvenagar', department: 'dept-util', avatar: 'SK', points: 0, badges: [], streak: 0 },
  { id: 'user-9', name: 'Commissioner Singh', email: 'admin@gov', role: 'admin', locality: null, department: null, avatar: 'CS', points: 0, badges: [], streak: 0 },
];

export const BADGES_CATALOG = [
  { id: 'first-report', name: 'First Report', icon: '🏁', description: 'Reported your first issue', color: 'var(--primary)' },
  { id: 'watchdog', name: 'Watchdog', icon: '👁️', description: 'Reported 10+ issues', color: 'var(--warning)' },
  { id: 'community-hero', name: 'Community Hero', icon: '🦸', description: 'Issues resolved through your reports', color: 'var(--danger)' },
  { id: 'verifier', name: 'Verifier', icon: '✅', description: 'Verified 5+ resolutions', color: 'var(--success)' },
  { id: 'active-voter', name: 'Active Voter', icon: '🗳️', description: 'Voted on 20+ issues', color: 'var(--accent)' },
];

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 86400000).toISOString();
}
export const SEED_ISSUES = [];


export const LOCALITY_EQUITY_DATA = LOCALITIES.map((loc, idx) => ({
  locality: loc.id,
  avgResolutionHours: 40 + (idx * 5),
  issuesPerCapita: 0.0012 + (idx * 0.0001),
  totalIssues: 100 + (idx * 20),
  resolvedRate: 0.8 - (idx * 0.05),
  budgetPerCapita: 1500 - (idx * 100),
  satisfactionScore: 85 - (idx * 4),
  equityScore: 90 - (idx * 5),
}));

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
  { name: 'Utilities', avgHours: 18, slaBreachRate: 12, totalIssues: 156, resolved: 138 },
  { name: 'Parks & Rec', avgHours: 96, slaBreachRate: 35, totalIssues: 89, resolved: 62 },
  { name: 'Traffic Mgmt', avgHours: 8, slaBreachRate: 8, totalIssues: 134, resolved: 128 },
  { name: 'Sanitation', avgHours: 36, slaBreachRate: 18, totalIssues: 97, resolved: 80 },
];
