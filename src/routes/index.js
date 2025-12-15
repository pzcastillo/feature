const express = require('express');
const router = express.Router();
const auth = require('./auth');
const accounts = require('./accounts');
const departments = require('./departments');
const authenticate = require('../middleware/auth');

router.use('/auth', auth);
router.use('/accounts', accounts);
router.use('/departments', departments);

module.exports = router;
