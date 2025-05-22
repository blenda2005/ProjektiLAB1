const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} = require('../models/clientModel');

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
    body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
    body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const { status, userId } = req.body;
    await createClient(status, userId);
    res.status(201).json({ message: 'Client created successfully' });
  })
);

// READ ALL
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const clients = await getAllClients();
    res.json({ data: clients });
  })
);

// READ BY ID
router.get(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('clientId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const client = await getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ data: client });
  })
);

// UPDATE
router.put(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('clientId must be a positive integer'),
    body('status').optional().isIn(['Active', 'Inactive']),
    body('userId').optional().isInt({ gt: 0 }),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    await updateClient(req.params.id, req.body);
    res.status(200).json({ message: 'Client updated successfully' });
  })
);

// DELETE
router.delete(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('clientId must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    await deleteClient(req.params.id);
    res.status(200).json({ message: 'Client deleted successfully' });
  })
);

module.exports = router;
