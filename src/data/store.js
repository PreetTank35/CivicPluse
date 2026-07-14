// ============================================
// CivicPulse — Data Store
// localStorage-first with optional Supabase sync
// ============================================

import {
  SEED_PROBLEMS, SEED_SUPPORT, SEED_COMMENTS, SEED_STATUS_HISTORY,
  USERS, DEPARTMENTS, SLA_CONFIGS, CATEGORIES,
  SUPPORT_THRESHOLD, MAX_DAILY_POSTS, MAX_FLAGS_TO_HIDE
} from './mockData';
import { LOCALITIES, getNearestLocality } from './localities';
import { supabase } from '../lib/supabase';

const STORE_KEY = 'civicpulse_store_v1';
const INITIALIZED_KEY = 'civicpulse_initialized_v1';

// ── Event Bus ──
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

// ── Store I/O ──
function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.error('Store load error:', e); }
  return null;
}

function saveStore(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { console.error('Store save error:', e); }
}

// ── Initialize ──
export function initializeStore() {
  const isInit = localStorage.getItem(INITIALIZED_KEY);
  if (isInit) {
    const data = loadStore();
    if (data) return data;
  }

  const state = {
    problems: SEED_PROBLEMS,
    support: SEED_SUPPORT,
    comments: SEED_COMMENTS,
    statusHistory: SEED_STATUS_HISTORY,
    notifications: [],
    users: USERS,
    departments: DEPARTMENTS,
    localities: LOCALITIES,
    slaConfigs: SLA_CONFIGS,
    currentUserId: 'user-1',
    currentRole: 'citizen',
    dailyPostCounts: {},
  };

  saveStore(state);
  localStorage.setItem(INITIALIZED_KEY, 'true');
  return state;
}

function getState() { return loadStore() || initializeStore(); }

function updateState(updater) {
  const state = getState();
  updater(state);
  saveStore(state);
  return state;
}

// ── User Queries ──
export function getCurrentUserId() { return getState().currentUserId; }
export function getUserById(id) { return getState().users.find(u => u.id === id); }
export function getAllUsers() { return getState().users; }

// ── Problem Queries ──
export function getAllProblems() { return getState().problems.filter(p => !p.is_hidden); }
export function getProblemById(id) { return getState().problems.find(p => p.id === id); }
export function getProblemsByLocality(localityId) {
  return getState().problems.filter(p => p.locality_id === localityId && !p.is_hidden);
}
export function getProblemsByStatus(status) {
  return getState().problems.filter(p => p.status === status && !p.is_hidden);
}
export function getProblemsByCategory(category) {
  return getState().problems.filter(p => p.category === category && !p.is_hidden);
}

/**
 * Locality-first feed ranking algorithm.
 * Posts from user's own ward first → expanding radius → weighted by recency + support velocity.
 */
export function getFeedProblems(userLocalityId, userLat, userLng) {
  const problems = getAllProblems();

  return problems
    .map(p => {
      let score = 0;

      // Locality match (highest priority)
      if (p.locality_id === userLocalityId) {
        score += 1000;
      }

      // Distance-based scoring (closer = higher)
      if (userLat && userLng) {
        const dist = Math.sqrt(
          Math.pow(p.location_lat - userLat, 2) +
          Math.pow(p.location_lng - userLng, 2)
        );
        // Invert distance: closer means higher score. Max ~500 points for <1km
        score += Math.max(0, 500 - (dist * 5000));
      }

      // Recency boost (exponential decay over 7 days)
      const ageHours = (Date.now() - new Date(p.created_at).getTime()) / 3600000;
      score += Math.max(0, 200 * Math.exp(-ageHours / 168)); // 168h = 7 days

      // Support velocity (supports per hour, capped)
      const supportVelocity = ageHours > 0 ? p.support_count / ageHours : p.support_count;
      score += Math.min(supportVelocity * 50, 150);

      // Raw support count
      score += Math.min(p.support_count * 2, 100);

      return { ...p, _feedScore: score };
    })
    .sort((a, b) => b._feedScore - a._feedScore);
}

/**
 * Find potential duplicates (same category within ~100m radius)
 */
export function getDuplicateCandidates(category, lat, lng, radiusKm = 0.1) {
  const problems = getAllProblems();
  return problems.filter(p => {
    if (p.category !== category) return false;
    if (p.status === 'resolved' || p.status === 'rejected') return false;
    const dist = Math.sqrt(
      Math.pow(p.location_lat - lat, 2) + Math.pow(p.location_lng - lng, 2)
    );
    // Rough: 0.001 degree ≈ 111m
    return dist < (radiusKm / 111);
  });
}

// ── Problem Mutations ──
export function createProblem(data) {
  const state = getState();
  const userId = state.currentUserId;

  // Rate limiting
  const today = new Date().toISOString().split('T')[0];
  const dailyCounts = state.dailyPostCounts || {};
  const userCount = dailyCounts[`${userId}_${today}`] || 0;
  if (userCount >= MAX_DAILY_POSTS) {
    return { error: `Daily limit of ${MAX_DAILY_POSTS} posts reached. Try again tomorrow.` };
  }

  const id = `prob-${Date.now()}`;
  const locality = getNearestLocality(data.location_lat, data.location_lng);

  const newProblem = {
    id,
    user_id: userId,
    title: data.title,
    description: data.description,
    category: data.category,
    media_urls: data.media_urls || [],
    location_lat: data.location_lat,
    location_lng: data.location_lng,
    location_address: data.location_address || '',
    locality_id: data.locality_id || locality?.id || 'kothrud',
    status: 'reported',
    support_count: 1, // auto-support own post
    comment_count: 0,
    duplicate_of_id: null,
    flag_count: 0,
    is_hidden: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  updateState(s => {
    s.problems.unshift(newProblem);
    // Auto-support own post
    s.support.push({ problem_id: id, user_id: userId });
    // Track daily count
    if (!s.dailyPostCounts) s.dailyPostCounts = {};
    s.dailyPostCounts[`${userId}_${today}`] = userCount + 1;
    // Status history
    s.statusHistory.push({
      problem_id: id,
      old_status: null,
      new_status: 'reported',
      changed_by: userId,
      note: 'Problem reported',
      created_at: newProblem.created_at,
    });
  });

  events.emit('problemCreated', newProblem);
  return { problem: newProblem, error: null };
}

// ── Support Logic ──
export function getSupporters(problemId) {
  return getState().support.filter(s => s.problem_id === problemId);
}

export function hasUserSupported(problemId, userId) {
  return getState().support.some(s => s.problem_id === problemId && s.user_id === userId);
}

export function toggleSupport(problemId) {
  const state = getState();
  const userId = state.currentUserId;
  const problem = state.problems.find(p => p.id === problemId);
  if (!problem) return { supported: false, count: 0 };

  // Can't support own post
  if (problem.user_id === userId) return { supported: false, count: problem.support_count, ownPost: true };

  const existing = state.support.find(s => s.problem_id === problemId && s.user_id === userId);

  if (existing) {
    // Remove support
    updateState(s => {
      s.support = s.support.filter(
        sv => !(sv.problem_id === problemId && sv.user_id === userId)
      );
      const p = s.problems.find(pp => pp.id === problemId);
      if (p) {
        p.support_count = Math.max(0, p.support_count - 1);
        p.updated_at = new Date().toISOString();
      }
    });
    events.emit('problemUpdated', problemId);
    return { supported: false, count: problem.support_count - 1 };
  } else {
    // Add support
    updateState(s => {
      s.support.push({ problem_id: problemId, user_id: userId });
      const p = s.problems.find(pp => pp.id === problemId);
      if (p) {
        p.support_count += 1;
        p.updated_at = new Date().toISOString();
      }
    });

    events.emit('problemUpdated', problemId);

    // Check auto-escalation threshold
    const updatedProblem = getProblemById(problemId);
    if (updatedProblem && updatedProblem.support_count >= SUPPORT_THRESHOLD && updatedProblem.status === 'reported') {
      // Add notification for auto-escalation candidate
      addNotification(
        problem.user_id,
        'support_milestone',
        `Your post "${problem.title}" reached ${SUPPORT_THRESHOLD} supports and is ready for escalation!`,
        problemId
      );
    }

    return { supported: true, count: problem.support_count + 1 };
  }
}

// ── Status Updates ──
export function updateProblemStatus(problemId, newStatus, note = '', changedBy = null) {
  const state = getState();
  const problem = state.problems.find(p => p.id === problemId);
  if (!problem) return;

  const oldStatus = problem.status;
  const actor = changedBy || state.currentUserId;

  updateState(s => {
    const p = s.problems.find(pp => pp.id === problemId);
    if (p) {
      p.status = newStatus;
      p.updated_at = new Date().toISOString();
    }
    s.statusHistory.push({
      problem_id: problemId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: actor,
      note: note || `Status changed to ${newStatus}`,
      created_at: new Date().toISOString(),
    });
  });

  // Notify all supporters of status change
  const supporters = getSupporters(problemId);
  supporters.forEach(s => {
    addNotification(
      s.user_id,
      'status_change',
      `"${problem.title}" status changed to ${newStatus}`,
      problemId
    );
  });

  // Also notify the problem creator
  if (!supporters.some(s => s.user_id === problem.user_id)) {
    addNotification(
      problem.user_id,
      'status_change',
      `Your post "${problem.title}" status changed to ${newStatus}`,
      problemId
    );
  }

  events.emit('problemUpdated', problemId);
}

// ── Escalation ──
export function generateEscalationPayload(problem) {
  const locality = LOCALITIES.find(l => l.id === problem.locality_id);
  const category = CATEGORIES.find(c => c.id === problem.category);
  const statusHistory = getStatusHistory(problem.id);

  return {
    problem_id: problem.id,
    title: problem.title,
    description: problem.description,
    category: {
      id: problem.category,
      label: category?.label || problem.category,
    },
    location: {
      lat: problem.location_lat,
      lng: problem.location_lng,
      address: problem.location_address,
      locality: locality?.name || 'Unknown',
      ward: locality?.ward_number || 'Unknown',
      pincode: locality?.pincode || 'Unknown',
    },
    evidence: {
      media_urls: problem.media_urls,
      support_count: problem.support_count,
      comment_count: problem.comment_count,
    },
    timeline: statusHistory.map(h => ({
      status: h.new_status,
      timestamp: h.created_at,
      note: h.note,
    })),
    generated_at: new Date().toISOString(),
  };
}

export function escalateProblem(problemId, departmentId) {
  const problem = getProblemById(problemId);
  if (!problem) return { error: 'Problem not found' };

  const dept = getState().departments.find(d => d.id === departmentId);
  if (!dept) return { error: 'Department not found' };

  const payload = generateEscalationPayload(problem);

  updateState(s => {
    // Create escalation record
    if (!s.escalations) s.escalations = [];
    s.escalations.push({
      id: `esc-${Date.now()}`,
      problem_id: problemId,
      department_id: departmentId,
      escalated_by: s.currentUserId,
      escalation_payload: payload,
      status: 'sent',
      sent_at: new Date().toISOString(),
      resolved_at: null,
    });
  });

  // Update problem status to escalated
  updateProblemStatus(problemId, 'escalated', `Escalated to ${dept.name}`);

  return { success: true, payload };
}

// ── Comments ──
export function getComments(problemId) {
  return getState().comments.filter(c => c.problem_id === problemId);
}

export function addComment(problemId, text, mediaUrl = null) {
  const state = getState();
  const comment = {
    id: `cmt-${Date.now()}`,
    problem_id: problemId,
    user_id: state.currentUserId,
    text,
    media_url: mediaUrl,
    created_at: new Date().toISOString(),
  };

  updateState(s => {
    s.comments.push(comment);
    const p = s.problems.find(pp => pp.id === problemId);
    if (p) {
      p.comment_count = (p.comment_count || 0) + 1;
      p.updated_at = new Date().toISOString();
    }
  });

  // Notify problem creator about new comment
  const problem = getProblemById(problemId);
  if (problem && problem.user_id !== state.currentUserId) {
    const commenter = getUserById(state.currentUserId);
    addNotification(
      problem.user_id,
      'comment',
      `${commenter?.name || 'Someone'} commented on "${problem.title}"`,
      problemId
    );
  }

  events.emit('problemUpdated', problemId);
  return comment;
}

// ── Status History ──
export function getStatusHistory(problemId) {
  return getState().statusHistory
    .filter(h => h.problem_id === problemId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// ── Flagging ──
export function flagProblem(problemId) {
  updateState(s => {
    const p = s.problems.find(pp => pp.id === problemId);
    if (p) {
      p.flag_count = (p.flag_count || 0) + 1;
      if (p.flag_count >= MAX_FLAGS_TO_HIDE) {
        p.is_hidden = true;
      }
    }
  });
  events.emit('problemUpdated', problemId);
}

// ── Merge Duplicate ──
export function mergeDuplicate(duplicateId, canonicalId) {
  updateState(s => {
    const dup = s.problems.find(p => p.id === duplicateId);
    if (dup) {
      dup.duplicate_of_id = canonicalId;
      dup.status = 'rejected';
      dup.updated_at = new Date().toISOString();
    }
    // Transfer support from duplicate to canonical
    const canonical = s.problems.find(p => p.id === canonicalId);
    const dupSupport = s.support.filter(sv => sv.problem_id === duplicateId);
    dupSupport.forEach(ds => {
      if (!s.support.some(sv => sv.problem_id === canonicalId && sv.user_id === ds.user_id)) {
        s.support.push({ problem_id: canonicalId, user_id: ds.user_id });
        if (canonical) canonical.support_count += 1;
      }
    });
  });
  events.emit('problemUpdated', duplicateId);
  events.emit('problemUpdated', canonicalId);
}

// ── Notifications ──
export function getNotifications(userId) {
  return getState().notifications
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getUnreadNotificationCount(userId) {
  return getState().notifications.filter(n => n.user_id === userId && !n.is_read).length;
}

export function addNotification(userId, type, message, relatedProblemId = null) {
  updateState(s => {
    s.notifications.push({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      type,
      message,
      related_problem_id: relatedProblemId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  });
  events.emit('notificationCreated', userId);
}

export function markNotificationRead(notifId) {
  updateState(s => {
    const n = s.notifications.find(nn => nn.id === notifId);
    if (n) n.is_read = true;
  });
  events.emit('notificationsUpdated');
}

export function markAllNotificationsRead(userId) {
  updateState(s => {
    s.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
  });
  events.emit('notificationsUpdated');
}

// ── Locality Queries ──
export function getAllLocalities() { return getState().localities; }
export function getLocalityById(id) { return getState().localities.find(l => l.id === id); }

// ── Department Queries ──
export function getAllDepartments() { return getState().departments; }
export function getDepartmentById(id) { return getState().departments.find(d => d.id === id); }
export function getDepartmentForCategory(category) {
  return getState().departments.find(d => d.category === category);
}

// ── Dashboard Stats ──
export function getDashboardStats(localityFilter = null) {
  let problems = getAllProblems();
  if (localityFilter) {
    problems = problems.filter(p => p.locality_id === localityFilter);
  }

  const now = new Date();
  const open = problems.filter(p => ['reported', 'verified', 'escalated', 'in_progress'].includes(p.status));
  const resolved = problems.filter(p => p.status === 'resolved');
  const escalated = problems.filter(p => p.status === 'escalated');

  // Calculate average resolution time from status history
  let avgResolutionHours = 0;
  if (resolved.length > 0) {
    const times = resolved.map(p => {
      const created = new Date(p.created_at);
      const updated = new Date(p.updated_at);
      return (updated - created) / 3600000;
    }).filter(t => t > 0);
    avgResolutionHours = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }

  // Category breakdown
  const categoryBreakdown = {};
  problems.forEach(p => {
    const cat = CATEGORIES.find(c => c.id === p.category);
    const label = cat?.label || p.category;
    categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1;
  });

  return {
    totalProblems: problems.length,
    totalOpen: open.length,
    totalResolved: resolved.length,
    totalEscalated: escalated.length,
    resolutionRate: problems.length > 0 ? Math.round((resolved.length / problems.length) * 100) : 0,
    avgResolutionHours: `${avgResolutionHours}h`,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
  };
}

// ── Role Management ──
export function setCurrentRole(role) {
  updateState(s => { s.currentRole = role; });
  events.emit('roleChanged', role);
}

export function setCurrentUser(userId) {
  updateState(s => { s.currentUserId = userId; });
}

// ── Reset ──
export function resetStore() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
  initializeStore();
  events.emit('storeReset');
}

// ── Backwards Compatibility & Aliases ──
export const getAllIssues = getAllProblems;
export const getIssueById = getProblemById;
export const createIssue = createProblem;
export const voteIssue = toggleSupport;
export const getCurrentUser = () => getUserById(getCurrentUserId());
export const verifyResolution = (problemId) => updateProblemStatus(problemId, 'verified', 'Verified resolved by citizen');
export const verifyIssueBySubAdmin = (problemId) => updateProblemStatus(problemId, 'verified', 'Verified by Sub-Admin');
export const updateIssueStatus = updateProblemStatus;
export const getIssuesByUserId = (userId) => getAllProblems().filter(p => p.user_id === userId);

