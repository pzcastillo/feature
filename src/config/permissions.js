const permissions = {
  ADMIN: [
    "accounts:create", "accounts:read", "accounts:update", "accounts:disable", "accounts:delete",
    "departments:create", "departments:get", "departments:get:id", "departments:update", "departments:delete"
  ],
  
  SUPER_ADMIN: [
    ...require('./permissions').ADMIN,
    "departments:patch:status",
  ],

  MANAGER: [
    "accounts:create:own-dept",
    "accounts:read:own-dept",
    "accounts:update:own-dept",
    "accounts:disable:own-dept",
    "accounts:delete:own-dept",
    "departments:get",
    "departments:get:id"
  ],

  HR: [
    "accounts:read",
    "accounts:update",
    "departments:get",
    "departments:get:id"
  ],

  EMPLOYEE: ["accounts:read_own", "departments:get", "departments:get:id"],
  CLIENT:    ["accounts:read_own", "departments:get", "departments:get:id"],
};

permissions.SUPER_ADMIN = [
  ...permissions.ADMIN,
  "departments:patch:status",
];

/**
 * Check if a role has permission for a specific action
 * @param {string} role
 * @param {string} action  e.g. "accounts:create"
 * @returns {boolean}
 */
function can(role, action) {
  if (role === 'SUPER_ADMIN') return true;

  const rolePermissions = permissions[role] || [];
  return rolePermissions.includes(action);
}

module.exports = {
  permissions,
  can,
  // optional shorthand
  authorize: (requiredAction) => (req, res, next) => {
    if (!can(req.user?.role_name, requiredAction)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  }
};
