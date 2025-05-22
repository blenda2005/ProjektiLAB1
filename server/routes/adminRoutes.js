const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} = require('../models/adminModel');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// CREATE
router.post(
  '/',
  [
    body('responsibility').trim().notEmpty().withMessage('Responsibility is required'),
    body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const { responsibility, userId } = req.body;
    await createAdmin(responsibility, userId);
    res.status(201).json({ message: 'Admin created successfully' });
  })
);

// READ ALL
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const admins = await getAllAdmins();
    res.json({ data: admins });
  })
);

// READ BY ID
router.get(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('adminId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const admin = await getAdminById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ data: admin });
  })
);

// UPDATE
router.put(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('adminId must be a positive integer'),
    body('responsibility').optional().trim(),
    body('userId').optional().isInt({ gt: 0 }),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    await updateAdmin(req.params.id, req.body);
    res.status(200).json({ message: 'Admin updated successfully' });
  })
);

// DELETE
router.delete(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('adminId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    await deleteAdmin(req.params.id);
    res.status(200).json({ message: 'Admin deleted successfully' });
  })
);

module.exports = router;
