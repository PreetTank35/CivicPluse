// ============================================
// CivicPulse — localStorage & Supabase Store
// ============================================

import { SEED_ISSUES, USERS, DEPARTMENTS, SLA_CONFIGS } from './mockData';
import { LOCALITIES } from './localities';
import { supabase } from '../lib/supabase';

const STORE_KEY = 'civicpulse_store_v2';
const INITIALIZED_KEY = 'civicpulse_initialized_v2';

class EventBus {
  constructor() { this.listeners = {}; }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
}

export const events = new EventBus();

const DEMO_TITLES = [
  'Large pothole near Paud Road signal',
  'Broken streetlight near Vanaz Metro station',
  'Severe water shortage in Sector 4',
  'Garbage pile up in Koregaon Park Lane 6',
  'Broken swings and overgrown weeds in Kamla Nehru Park'
];

function isDemoIssue(issue) {
  if (!issue) return false;
  if (/^issue-[1-8]$/.test(issue.id)) return true;
  return DEMO_TITLES.some(t => issue.title && issue.title.includes(t));
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.issues)) {
        const cleanedIssues = data.issues.filter(i => !isDemoIssue(i));
        if (cleanedIssues.length !== data.issues.length) {
          data.issues = cleanedIssues;
          saveStore(data);
        }
      }
      return data;
    }
  } catch (e) { console.error('Store load error:', e); }
  return null;
}

function saveStore(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } 
  catch (e) { console.error('Store save error:', e); }
}

async function syncIssuesFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      updateState(s => {
        data.forEach(remoteIssue => {
          if (isDemoIssue(remoteIssue)) return;
          if (!s.issues.some(i => i.id === remoteIssue.id)) {
            const remoteEvidence = (remoteIssue.evidence_urls || []).map(u => typeof u === 'object' && u !== null ? (u.url || u.src || '') : String(u)).filter(Boolean);
            const remoteVideoUrl = remoteIssue.video_url || remoteEvidence.find(u => u.includes('.mp4') || u.includes('.webm') || u.includes('.mov') || u.startsWith('data:video/')) || null;
            s.issues.unshift({
              ...remoteIssue,
              location: {
                locality_name: remoteIssue.locality_id || 'Pune',
                city: 'Pune',
                state: 'Maharashtra',
                address: remoteIssue.address || '',
                lat: remoteIssue.lat || 18.5204,
                lng: remoteIssue.lng || 73.8567,
              },
              evidence: remoteEvidence,
              video_url: remoteVideoUrl,
              voters: [],
              comments: [],
              priority_score: 50,
              timeline: [{ status: remoteIssue.status || 'open', time: remoteIssue.created_at, actor: 'system', note: 'Reported' }]
            });
          }
        });
      });
      events.emit('issueCreated', null);
    }
  } catch (err) { /* ignore offline */ }
}

export function initializeStore() {
  const isInit = localStorage.getItem(INITIALIZED_KEY);
  if (isInit) {
    const data = loadStore();
    if (data) {
      syncIssuesFromSupabase();
      return data;
    }
  }

  const state = {
    issues: SEED_ISSUES,
    users: USERS,
    departments: DEPARTMENTS,
    localities: LOCALITIES,
    slaConfigs: SLA_CONFIGS,
    currentUserId: 'user-1',
    currentRole: 'citizen',
  };

  saveStore(state);
  localStorage.setItem(INITIALIZED_KEY, 'true');
  syncIssuesFromSupabase();
  return state;
}

function getState() { return loadStore() || initializeStore(); }
function updateState(updater) {
  const state = getState();
  updater(state);
  saveStore(state);
  return state;
}

export function getCurrentUser() {
  const state = getState();
  return state.users.find(u => u.id === state.currentUserId) || state.users[0];
}

export function getCurrentRole() { return getState().currentRole; }

export function setCurrentRole(role) {
  updateState(s => { s.currentRole = role; });
  const state = getState();
  const userForRole = state.users.find(u => u.role === role);
  if (userForRole) {
    updateState(s => { s.currentUserId = userForRole.id; });
  }
  events.emit('roleChanged', role);
}

export function getAllIssues() { return getState().issues; }
export function getIssueById(id) { return getState().issues.find(i => i.id === id); }
export function getIssuesByStatus(status) { return getState().issues.filter(i => i.status === status); }
export function getIssuesByCategory(category) { return getState().issues.filter(i => i.category === category); }
export function getIssuesByLocality(locId) { return getState().issues.filter(i => i.locality === locId); }

export function createIssue(issueData) {
  const id = `issue-${Date.now()}`;
  const normalizedEvidence = (issueData.evidence || []).map(e => typeof e === 'object' && e !== null ? (e.url || e.src || '') : String(e)).filter(Boolean);
  const videoUrl = issueData.video_url || normalizedEvidence.find(u => u.includes('.mp4') || u.includes('.webm') || u.includes('.mov') || u.startsWith('data:video/')) || null;

  const newIssue = {
    id,
    ...issueData,
    votes: 1,
    voters: [getState().currentUserId],
    comments: [],
    evidence: normalizedEvidence,
    video_url: videoUrl,
    priority_score: calculatePriority(issueData),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sla_deadline: calculateSLADeadline(issueData.category, issueData.severity),
    timeline: [
      { status: 'open', time: new Date().toISOString(), actor: getState().currentUserId, note: `Issue reported` },
    ],
    canonical_id: null,
  };

  updateState(s => { s.issues.unshift(newIssue); });
  events.emit('issueCreated', newIssue);

  if (supabase) {
    supabase.from('issues').insert({
      id: newIssue.id,
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category,
      severity: newIssue.severity,
      status: 'open',
      locality_id: newIssue.locality || 'kothrud',
      address: newIssue.location?.address || '',
      lat: newIssue.location?.lat || 18.5204,
      lng: newIssue.location?.lng || 73.8567,
      reporter_id: getState().currentUserId,
      evidence_urls: normalizedEvidence,
      video_url: videoUrl
    }).catch(e => console.error('Supabase issue sync error:', e));
  }

  return newIssue;
}

export function updateIssueStatus(issueId, newStatus, note = '') {
  updateState(s => {
    const issue = s.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = newStatus;
      issue.updated_at = new Date().toISOString();
      issue.timeline.push({
        status: newStatus, time: new Date().toISOString(),
        actor: s.currentUserId, note: note || `Status changed to ${newStatus}`,
      });
    }
  });
  events.emit('issueUpdated', issueId);
  if (supabase) {
    supabase.from('issues').update({ status: newStatus }).eq('id', issueId).catch(() => {});
  }
}

export function voteIssue(issueId) {
  const state = getState();
  const issue = state.issues.find(i => i.id === issueId);
  if (!issue) return false;

  const userId = state.currentUserId;
  if (issue.voters.includes(userId)) {
    updateState(s => {
      const i = s.issues.find(x => x.id === issueId);
      i.voters = i.voters.filter(v => v !== userId);
      i.votes = i.voters.length;
      i.priority_score = calculatePriority(i);
    });
    events.emit('issueUpdated', issueId);
    return false;
  } else {
    updateState(s => {
      const i = s.issues.find(x => x.id === issueId);
      i.voters.push(userId);
      i.votes = i.voters.length;
      i.priority_score = calculatePriority(i);
    });
    events.emit('issueUpdated', issueId);
    return true;
  }
}

export function addComment(issueId, text) {
  const state = getState();
  const comment = { id: `comment-${Date.now()}`, user: state.currentUserId, text, time: new Date().toISOString() };
  updateState(s => {
    const issue = s.issues.find(i => i.id === issueId);
    if (issue) { issue.comments.push(comment); issue.updated_at = new Date().toISOString(); }
  });
  events.emit('issueUpdated', issueId);
  if (supabase) {
    supabase.from('comments').insert({
      id: comment.id,
      issue_id: issueId,
      user_id: state.currentUserId,
      content: text
    }).catch(() => {});
  }
  return comment;
}

export function verifyResolution(issueId, approved) {
  updateState(s => {
    const issue = s.issues.find(i => i.id === issueId);
    if (issue && issue.resolution_proof) {
      if (approved) issue.resolution_proof.citizen_yes_votes += 1;
      else issue.resolution_proof.citizen_no_votes += 1;
      
      if (issue.resolution_proof.citizen_yes_votes >= issue.resolution_proof.threshold) {
        issue.status = 'verified';
        issue.timeline.push({
          status: 'verified', time: new Date().toISOString(), actor: 'system',
          note: `Community verified — ${issue.resolution_proof.citizen_yes_votes} yes votes`,
        });
      }
    }
  });
  events.emit('issueUpdated', issueId);
}

function calculatePriority(issue) {
  let score = 0;
  const sevWeights = { low: 10, medium: 30, high: 60, critical: 90 };
  score += sevWeights[issue.severity] || 20;
  score += Math.min((issue.votes || 0) * 0.5, 20);
  if (issue.sla_deadline) {
    const deadline = new Date(issue.sla_deadline);
    if (deadline < new Date()) {
      const hoursOverdue = (Date.now() - deadline.getTime()) / 3600000;
      score += Math.min(hoursOverdue * 0.5, 15);
    }
  }
  return Math.min(Math.round(score), 100);
}

function calculateSLADeadline(category, severity) {
  const config = SLA_CONFIGS.find(c => c.category === category && c.severity === severity) || { hours: 72 };
  return new Date(Date.now() + config.hours * 3600000).toISOString();
}

export function getUserById(id) { return getState().users.find(u => u.id === id); }
export function getDepartmentById(id) { return getState().departments.find(d => d.id === id); }
export function getLocalityById(id) { return getState().localities.find(w => w.id === id); }
export function getAllLocalities() { return getState().localities; }
export function getAllDepartments() { return getState().departments; }
export function getAllUsers() { return getState().users; }

export function getDashboardStats() {
  const issues = getAllIssues();
  const now = new Date();
  const openIssues = issues.filter(i => ['open', 'acknowledged', 'in_progress', 'escalated'].includes(i.status));
  const resolvedIssues = issues.filter(i => ['resolved', 'verified'].includes(i.status));
  const escalated = issues.filter(i => i.status === 'escalated');
  const slaBreached = issues.filter(i => {
    if (!i.sla_deadline) return false;
    return new Date(i.sla_deadline) < now && !['resolved', 'verified'].includes(i.status);
  });

  return {
    totalOpen: openIssues.length,
    totalResolved: resolvedIssues.length,
    totalEscalated: escalated.length,
    slaBreachCount: slaBreached.length,
    slaBreachRate: openIssues.length > 0 ? Math.round((slaBreached.length / openIssues.length) * 100) : 0,
    avgResolutionTime: '38h',
    citizenSatisfaction: 72,
    totalReported: issues.length,
  };
}

export function resetStore() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
  initializeStore();
  events.emit('storeReset');
}
