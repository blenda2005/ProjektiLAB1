const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../models/ticketsModel');

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets', details: err.message });
  }
});

// GET ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ticket', details: err.message });
  }
});

// CREATE ticket
router.post('/', async (req, res) => {
  try {
    const result = await createTicket(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket', details: err.message });
  }
});

// UPDATE ticket
router.put('/:id', async (req, res) => {
  try {
    const result = await updateTicket(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket', details: err.message });
  }
});

// DELETE ticket
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteTicket(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ticket', details: err.message });
  }
});

module.exports = router;
