const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  trimRequired,
  trimUpperRequired
} = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with username/email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 description: Username or email address (case-insensitive, trimmed)
 *               password:
 *                 type: string
 *                 format: password
 *               comp_code:
 *                 type: string
 *                 description: Company code
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post(
  '/login',
  [
    trimRequired('usernameOrEmail', 'Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    trimUpperRequired('comp_code', 'Company code is required'),
    validate
  ],
  controller.login
);

module.exports = router;
