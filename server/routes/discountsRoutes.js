const express = require('express');
const router = express.Router();
const {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount
} = require('../models/discountsModel');

// GET all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await getAllDiscounts();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch discounts', details: err.message });
  }
});

// GET discount by ID
router.get('/:id', async (req, res) => {
  try {
    const discount = await getDiscountById(req.params.id);
    if (!discount) return res.status(404).json({ error: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch discount', details: err.message });
  }
});

// CREATE discount
router.post('/', async (req, res) => {
  const { type, percentage, start_date, end_date, status, createdBy } = req.body;
  if (!type || percentage === undefined || !start_date || !end_date || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await createDiscount(type, percentage, start_date, end_date, status, createdBy);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create discount', details: err.message });
  }
});

// UPDATE discount
router.put('/:id', async (req, res) => {
  try {
    const result = await updateDiscount(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update discount', details: err.message });
  }
});

// DELETE discount
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteDiscount(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete discount', details: err.message });
  }
});

module.exports = router;
