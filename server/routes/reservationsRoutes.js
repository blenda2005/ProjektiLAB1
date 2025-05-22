const express = require('express');
const router = express.Router();
const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation
} = require('../models/reservationsModel');

// GET all reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await getAllReservations();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations', details: err.message });
  }
});

// GET reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservation', details: err.message });
  }
});

// CREATE reservation
router.post('/', async (req, res) => {
  try {
    const result = await createReservation(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reservation', details: err.message });
  }
});

// UPDATE reservation
router.put('/:id', async (req, res) => {
  try {
    const result = await updateReservation(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reservation', details: err.message });
  }
});

// DELETE reservation
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteReservation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reservation', details: err.message });
  }
});

module.exports = router;
