const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const requirePermission = require('../middleware/permission');

const { trimUpperRequired, trimRequired, trimOptional } = require('../middleware/validator');
const { body, param, query } = require('express-validator');
/**
 * @swagger
 * tags:
 *   - name: Accounts
 *     description: Employee account management (supports UUID and emp_id)
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new employee account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comp_code
 *               - emp_id
 *               - fullname
 *               - username
 *               - email
 *               - password
 *             properties:
 *               comp_code:
 *                 type: string
 *                 description: Required. Company code (auto uppercased)
 *               emp_id:
 *                 type: string
 *                 example: EMP042
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               department_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               user_type_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 *       422:
 *         description: Validation Failed
 */
router.post(
  '/',
  authenticate,                                              
  requirePermission(['accounts:create']),
  [
    trimUpperRequired('comp_code', 'Company code is required'),
    trimRequired('emp_id').isLength({ min: 3, max: 50 }).matches(/^[A-Z0-9\-_]+$/i),
    trimRequired('fullname'),
    trimRequired('username'),
    trimRequired('email').isEmail().normalizeEmail(),
    trimRequired('password').isLength({ min: 8 }),

    body('department_id').optional({ nullable: true }).isUUID(4),
    body('role_id').optional().isUUID(4),
    body('user_type_id').optional().isUUID(4),
    validate
  ],
  controller.createAccount
);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: List all accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comp_code
 *         schema: { type: string }
 *         description: SUPER_ADMIN only — override tenant
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of accounts
 *       401:
 *         description: Invalid
 */
router.get(
  '/',
  authenticate,                                              // ← REQUIRED
  requirePermission(['accounts:read']),
  [
    query('comp_code').optional().trim().notEmpty().toUpperCase(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('search').optional().trim(),
    validate
  ],
  controller.listAccounts
);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Account Found
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */

router.get(
  '/:id',
  authenticate,                                            
  requirePermission(['accounts:read', 'accounts:read_own', 'accounts:read:own-dept']),
  [param('id').isUUID(4), validate],
  controller.getAccount
);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update account by UUID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emp_id: { type: string }
 *               fullname: { type: string }
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password, minLength: 8 }
 *               department_id: { type: string, format: uuid, nullable: true }
 *               role_id: { type: string, format: uuid }
 *               user_type_id: { type: string, format: uuid }
 *               status: { type: string, enum: [active, disabled] }
 *     responses:
 *       200:
 *         description: Account updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 */
router.put(
  '/:id',
  authenticate,                                              // ← REQUIRED
  requirePermission(['accounts:update', 'accounts:update_own', 'accounts:update:own-dept']),
  [
    param('id').isUUID(4),
    trimUpperRequired('comp_code', 'Company code is required'),  // ← NO .optional()
    trimOptional('emp_id').isLength({ min: 3, max: 50 }).matches(/^[A-Z0-9\-_]+$/i),
    trimOptional('fullname'),
    trimOptional('username'),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 8 }),
    body('department_id').optional({ nullable: true }).isUUID(4),
    body('role_id').optional().isUUID(4),
    body('status').optional().isIn(['active', 'disabled']),
    validate
  ],
  controller.updateAccount
);

/**
 * @swagger
 * /accounts/{id}/disable:
 *   patch:
 *     summary: Disable account by UUID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Account updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 */
router.patch('/:id/disable',
  authenticate, 
  requirePermission(['accounts:disable']), 
  [param('id').isUUID(4), validate], 
  controller.disableAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Permanently delete account by UUID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Account deleted
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 */
router.delete('/:id', 
  authenticate, 
  requirePermission(['accounts:delete']), 
  [param('id').isUUID(4), validate], 
  controller.deleteAccount);

module.exports = router;
