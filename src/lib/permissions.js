// ============================================
// CivicPulse — RBAC Permissions System
// Single source of truth for all role-based access control
// ============================================

/**
 * Role definitions with display metadata
 */
export const ROLES = {
  citizen: {
    key: 'citizen',
    label: 'Citizen',
    icon: '👤',
    description: 'Report problems, support issues, track resolution',
  },
  moderator: {
    key: 'moderator',
    label: 'Locality Moderator',
    icon: '🛡️',
    description: 'Verify and manage issues in assigned locality',
  },
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    icon: '⚙️',
    description: 'Platform-wide management and configuration',
  },
};

/**
 * Permission actions mapped to which roles can perform them.
 * This is the SINGLE place permissions are defined.
 */
export const PERMISSIONS = {
  // Citizen actions
  'problem:create':         ['citizen', 'moderator', 'super_admin'],
  'problem:support':        ['citizen', 'moderator', 'super_admin'],
  'problem:comment':        ['citizen', 'moderator', 'super_admin'],
  'problem:flag':           ['citizen', 'moderator', 'super_admin'],
  'problem:view':           ['citizen', 'moderator', 'super_admin'],

  // Moderator actions
  'problem:verify':         ['moderator', 'super_admin'],
  'problem:reject':         ['moderator', 'super_admin'],
  'problem:merge_duplicate': ['moderator', 'super_admin'],
  'problem:escalate':       ['moderator', 'super_admin'],
  'problem:update_status':  ['moderator', 'super_admin'],

  // Control panel access
  'cp:access':              ['moderator', 'super_admin'],
  'cp:view_queue':          ['moderator', 'super_admin'],
  'cp:view_analytics':      ['moderator', 'super_admin'],
  'cp:view_map':            ['moderator', 'super_admin'],

  // Super admin only
  'cp:manage_departments':  ['super_admin'],
  'cp:manage_moderators':   ['super_admin'],
  'cp:manage_settings':     ['super_admin'],
  'cp:view_all_localities': ['super_admin'],
  'cp:view_audit_log':      ['super_admin'],
  'user:ban':               ['super_admin'],
  'user:assign_role':       ['super_admin'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, action) {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role) {
  const perms = {};
  for (const [action, roles] of Object.entries(PERMISSIONS)) {
    perms[action] = roles.includes(role);
  }
  return perms;
}

/**
 * Route access control — which roles can access which route prefixes
 */
const ROUTE_ACCESS = {
  '/':                  ['citizen', 'moderator', 'super_admin'],
  '/map':               ['citizen', 'moderator', 'super_admin'],
  '/post':              ['citizen', 'moderator', 'super_admin'],
  '/problem':           ['citizen', 'moderator', 'super_admin'],
  '/notifications':     ['citizen', 'moderator', 'super_admin'],
  '/profile':           ['citizen', 'moderator', 'super_admin'],
  '/onboarding':        ['citizen', 'moderator', 'super_admin'],
  '/control-panel':     ['moderator', 'super_admin'],
};

/**
 * Check if a role can access a given route
 */
export function canAccessRoute(role, path) {
  // Find the most specific matching route
  const sortedRoutes = Object.keys(ROUTE_ACCESS).sort((a, b) => b.length - a.length);
  for (const route of sortedRoutes) {
    if (path === route || path.startsWith(route + '/') || path.startsWith(route)) {
      return ROUTE_ACCESS[route]?.includes(role) ?? false;
    }
  }
  return true; // default allow for unmatched routes
}

/**
 * Navigation items for the Control Panel sidebar.
 * Items are conditionally rendered based on permissions.
 */
export const CP_NAV_ITEMS = [
  {
    path: '/control-panel',
    label: 'Overview',
    icon: 'LayoutDashboard',
    permission: 'cp:access',
    end: true,
  },
  {
    path: '/control-panel/queue',
    label: 'Case Queue',
    icon: 'ClipboardList',
    permission: 'cp:view_queue',
  },
  {
    path: '/control-panel/map',
    label: 'Map Heatmap',
    icon: 'Map',
    permission: 'cp:view_map',
  },
  {
    path: '/control-panel/departments',
    label: 'Departments',
    icon: 'Building2',
    permission: 'cp:manage_departments',
  },
  {
    path: '/control-panel/moderators',
    label: 'Moderators',
    icon: 'Users',
    permission: 'cp:manage_moderators',
  },
  {
    path: '/control-panel/settings',
    label: 'Settings',
    icon: 'Settings',
    permission: 'cp:manage_settings',
  },
];

/**
 * Get visible nav items for a role
 */
export function getVisibleNavItems(role) {
  return CP_NAV_ITEMS.filter(item => hasPermission(role, item.permission));
}

/**
 * Get the data scope filter for a role.
 * - super_admin: null (sees everything)
 * - moderator: their assigned locality ID
 * - citizen: their own locality (for feed) but can browse others
 */
export function getScopeFilter(role, assignedLocalityId) {
  if (role === 'super_admin') return null; // no filter — sees all
  if (role === 'moderator') return assignedLocalityId || null;
  return null; // citizens see all in feed (ranked by proximity)
}

/**
 * Check if a user is staff (moderator or super_admin)
 */
export function isStaff(role) {
  return role === 'moderator' || role === 'super_admin';
}

/**
 * Get the default redirect path for a role after login
 */
export function getDefaultPath(role) {
  if (role === 'moderator' || role === 'super_admin') return '/control-panel';
  return '/';
}
