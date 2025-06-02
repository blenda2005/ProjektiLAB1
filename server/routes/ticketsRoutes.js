const express = require('express');
const router = express.Router();
const ticketsModel = require('../models/ticketsModel');

// CREATE
router.post('/', async (req, res) => {
  try {
    const result = await ticketsModel.createTicket(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Gabim POST:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const tickets = await ticketsModel.getAllTickets();
    res.json(tickets);
  } catch (err) {
    console.error('Gabim GET all:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  try {
    const ticket = await ticketsModel.getTicketById(ticketId);
    res.json(ticket);
  } catch (err) {
    console.error('Gabim GET one:', err);
    res.status(404).json({ error: err.message });
  }
});

// UPDATE - PUT
router.put('/:id', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const adminId = parseInt(req.query.adminId);

  if (!adminId) {
    return res.status(400).json({ error: 'adminId mungon në query param' });
  }

  try {
    const result = await ticketsModel.updateTicket(ticketId, req.body, adminId);
    res.json(result);
  } catch (err) {
    console.error('Gabim PUT:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - DELETE
router.delete('/:id', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const adminId = parseInt(req.query.adminId);

  if (!adminId) {
    return res.status(400).json({ error: 'adminId mungon në query param' });
  }

  try {
    const result = await ticketsModel.deleteTicket(ticketId, adminId);
    res.json(result);
  } catch (err) {
    console.error('Gabim DELETE:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
