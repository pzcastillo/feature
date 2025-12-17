const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const query = (text, params = []) => pool.query(text, params);
const getClient = () => pool.connect();

function tQuery(text, params = [], comp_code) {
  if (comp_code === null) {
    return pool.query(text, params);
  }

  const sql = text.trim().replace(/;+$/, '');
  const values = [...params];
  const placeholder = `$${values.length + 1}`;

  let finalSql;
  if (/\sWHERE\s/i.test(sql)) {
    finalSql = sql.replace(/\sWHERE\s/i, ` WHERE comp_code = ${placeholder} AND `);
  } else {
    const insertPos = sql.search(/\s+(ORDER|LIMIT|GROUP|HAVING|FOR)\s/i);
    if (insertPos !== -1) {
      finalSql = sql.slice(0, insertPos) + ` WHERE comp_code = ${placeholder} ` + sql.slice(insertPos);
    } else {
      finalSql = sql + ` WHERE comp_code = ${placeholder}`;
    }
  }

  values.push(comp_code);
  return pool.query(finalSql, values);
}

function tInsertWithTenant(table, data, comp_code, returning = '*') {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');
  const compPlaceholder = `$${keys.length + 1}`;

  const text = `
    INSERT INTO ${table} (${columns}, comp_code) 
    VALUES (${placeholders}, ${compPlaceholder}) 
    RETURNING ${returning}
  `;

  return pool.query(text, [...values, comp_code]);
}

async function getAccountByEmpId(emp_id, comp_code) {
  const res = await tQuery(
    `SELECT * FROM accounts WHERE emp_id = $1`,
    [emp_id],
    comp_code
  );
  return res.rows[0] || null;
}

async function getAccountById(id, comp_code) {
  const res = await tQuery('SELECT * FROM accounts WHERE id = $1', [id], comp_code);
  return res.rows[0] || null;
}

async function empIdExists(emp_id, comp_code, excludeId = null) {
  const sql = excludeId
    ? `SELECT 1 FROM accounts WHERE emp_id = $1 AND id != $2`
    : `SELECT 1 FROM accounts WHERE emp_id = $1`;

  const params = excludeId ? [emp_id, excludeId] : [emp_id];
  const res = await tQuery(sql, params, comp_code);
  return res.rowCount > 0;
}

async function rawQuery(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

module.exports = {
  query,           // For global (non-tenant) tables
  tQuery,          // For tenant-scoped data
  tInsertWithTenant,
  rawQuery,
  getClient,
  pool,
  getAccountByEmpId,
  getAccountById,
  empIdExists,
};
