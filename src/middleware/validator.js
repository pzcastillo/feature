const { body, param, query } = require('express-validator');

// Helper to create trimmed required string validator
const trimRequired = (field, message = `${field} is required`) => {
  return body(field)
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage(message)
    .bail()
    .isString()
    .withMessage(`${field} must be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(message);
};

// Optional string → trim + convert empty to null
const trimOptional = (field) => {
  return body(field)
    .optional()
    .isString()
    .withMessage(`${field} must be a string`)
    .bail()
    .trim()
    .customSanitizer(value => (value === '' ? null : value));
};

// Required + trim + uppercase (for comp_code)
const trimUpperRequired = (field, message = `${field} is required`) => {
  return body(field)
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage(message)
    .bail()
    .isString()
    .withMessage(`${field} must be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(message)
    .bail()
    .toUpperCase();
};

// For route params (:id, :comp_code in URL)
const paramTrimUpper = (field) => {
  return param(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .toUpperCase();
};

module.exports = {
  trimRequired,
  trimOptional,
  trimUpperRequired,
  paramTrimUpper
};
