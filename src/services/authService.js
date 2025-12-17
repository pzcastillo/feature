const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function login({ usernameOrEmail, password, comp_code }) {
  const q = `
    SELECT 
      a.id, a.emp_id, a.fullname, a.username, a.email,
      a.password_hash, a.department_id, a.role_id, a.user_type_id,
      a.status, a.comp_code,
      r.role_name
    FROM accounts a
    LEFT JOIN roles r ON a.role_id = r.id
    WHERE (LOWER(a.username) = LOWER($1) OR LOWER(a.email) = LOWER($1))
      AND a.status = 'active'
  `;

  const result = await db.tQuery(q, [usernameOrEmail], comp_code);

  if (result.rowCount === 0) {
    throw { status: 401, message: 'Invalid credentials or company' };
  }

  const user = result.rows[0];

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    {
      sub: user.id,
      emp_id: user.emp_id,
      comp_code: user.comp_code,
      role_name: (user.role_name || 'EMPLOYEE').toUpperCase(),
      fullname: user.fullname
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn || '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      emp_id: user.emp_id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      department_id: user.department_id,
      role_name: (user.role_name || 'EMPLOYEE').toUpperCase(),
      comp_code: user.comp_code
    }
  };
}

module.exports = { login };
