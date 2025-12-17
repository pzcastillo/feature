const express = require('express');
const router = express.Router();
const controller = require('../controllers/departmentController');
const requirePermission = require('../middleware/permission');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body, query } = require('express-validator');
const { trimUpperRequired, trimRequired, trimOptional } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management
 */

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
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
 *               - department_name
 *             properties:
 *               comp_code:
 *                 type: string
 *                 description: Required company code
 *               department_name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Department created
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
  requirePermission(['departments:create']),
  trimUpperRequired('comp_code', 'Company code is required'),
  trimRequired('department_name', 'Department name is required'),
  trimOptional('description'),
  body('status').optional().isIn(['active', 'inactive']),
  validate,
  controller.create
);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comp_code
 *         schema: { type: string }
 *         description: SUPER_ADMIN only — override tenant
 *     responses:
 *       200:
 *         description: Array of departments
 *       401:
 *         description: Invalid
 */
router.get(
  '/',
  authenticate,
  requirePermission(['departments:get']),
  query('comp_code').optional().trim().notEmpty().toUpperCase(),
  validate,
  controller.getAll
);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department object
 *       401:
 *         description: Invalid
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
router.get('/:id', authenticate, requirePermission(['departments:get:id']), controller.getById);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comp_code
 *             properties:
 *               comp_code:
 *                 type: string
 *               department_name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Department updated
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
  authenticate,
  requirePermission(['departments:update']),
  trimUpperRequired('comp_code', 'Company code is required'),
  trimOptional('department_name'),
  trimOptional('description'),
  body('status').optional().isIn(['active', 'inactive']),
  validate,
  controller.update
);

/**
 * @swagger
 * /departments/{id}/status:
 *   patch:
 *     summary: Update department status (active/inactive)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comp_code
 *               - status
 *             properties:
 *               comp_code:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated
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
router.patch(
  '/:id/status',
  authenticate,
  requirePermission(['departments:patch:status']),
  trimUpperRequired('comp_code', 'Company code is required'),
  body('status').notEmpty().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  validate,
  controller.updateStatus
);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       204:
 *         description: Department deleted
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
  requirePermission(['departments:delete']), 
  controller.remove);

module.exports = router;
