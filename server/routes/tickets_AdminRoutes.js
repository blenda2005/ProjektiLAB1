const express = require('express');
const router = express.Router();
const ticketsAdminModel = require('../models/tickets_AdminModel');

// Create 
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const result = await createTicketsAdmin(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all 
router.get('/', async (req, res) => {
  try {
    const result = await getAllTicketsAdmin();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Getby
router.get('/:adminId/:ticketId', async (req, res) => {
  const { adminId, ticketId } = req.params;
  try {
    const result = await getTicketsAdminById(parseInt(adminId), parseInt(ticketId));
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Update
router.put('/:adminId/:ticketId', async (req, res) => {
  const { adminId, ticketId } = req.params;
  const data = req.body;

  try {
    const result = await updateTicketsAdmin(parseInt(adminId), parseInt(ticketId), data);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:adminId/:ticketId', async (req, res) => {
  const { adminId, ticketId } = req.params;

  try {
    const result = await deleteTicketsAdmin(parseInt(adminId), parseInt(ticketId));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
