const db = require('../db');
const accountService = require('../services/accountService');
const { trimUpperRequired } = require('../middleware/validator');

async function createAccount(req, res, next) {
  try {
    let comp_code = req.user.comp_code;

    // SUPER_ADMIN can create account in any company
    if (req.user.role_name === 'SUPER_ADMIN' && req.body.comp_code !== undefined) {
      comp_code = req.body.comp_code;
    }

    const account = await accountService.createAccount(comp_code, req.body);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
}

async function listAccounts(req, res, next) {
  try {
    let comp_code = req.user.comp_code;

    if (req.user.role_name === 'SUPER_ADMIN' && req.query.comp_code) {
      comp_code = req.query.comp_code;
    }

    const queryOptions = { ...req.query };

    // Restrict visibility by role
    if (['CLIENT', 'EMPLOYEE'].includes(req.user.role_name)) {
      queryOptions.emp_id = req.user.emp_id;
    } else if (req.user.role_name === 'MANAGER' && req.user.department_id) {
      queryOptions.department_id = req.user.department_id;
    }

    const accounts = await accountService.listAccounts(comp_code, queryOptions);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
}

async function getAccount(req, res, next) {
  try {
    const { id } = req.params;
    let comp_code = req.user.comp_code;

    if (req.user.role_name === 'SUPER_ADMIN') {
      const { rows } = await db.rawQuery('SELECT comp_code FROM accounts WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
      comp_code = rows[0].comp_code;
    }

    const account = await accountService.getAccountById(comp_code, id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  try {
    const { id } = req.params;
    let comp_code = req.user.comp_code;

    if (req.user.role_name === 'SUPER_ADMIN') {
      const { rows } = await db.rawQuery('SELECT comp_code FROM accounts WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
      comp_code = rows[0].comp_code;
    }

    const account = await accountService.updateAccount(comp_code, id, req.body);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
}

async function disableAccount(req, res, next) {
  try {
    const { id } = req.params;
    let comp_code = req.user.comp_code;

    if (req.user.role_name === 'SUPER_ADMIN') {
      const { rows } = await db.rawQuery('SELECT comp_code FROM accounts WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
      comp_code = rows[0].comp_code;
    }

    const account = await accountService.disableAccount(comp_code, id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const { id } = req.params;
    let comp_code = req.user.comp_code;

    if (req.user.role_name === 'SUPER_ADMIN') {
      const { rows } = await db.rawQuery('SELECT comp_code FROM accounts WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
      comp_code = rows[0].comp_code;
    }

    const deleted = await accountService.deleteAccount(comp_code, id);
    if (!deleted) return res.status(404).json({ error: 'Account not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAccount,
  listAccounts,
  getAccount,
  updateAccount,
  disableAccount,
  deleteAccount,
};
