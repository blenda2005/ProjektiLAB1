const express = require('express');
const router = express.Router();

const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../models/reservationModel');

// CREATE 
router.post('/', async (req, res) => {
  try {
    const reservation = req.body;
   
    const result = await createReservation(reservation);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all 
router.get('/', async (req, res) => {
  try {
    const reservations = await getAllReservations();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ  by ID
router.get('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await getReservationById(parseInt(reservationId, 10));
    res.json(reservation);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// UPDATE 
router.put('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservationData = req.body;
    const adminId = reservationData.adminId; 
    if (!adminId) {
      return res.status(400).json({ error: 'adminId mungon në kërkesë' });
    }
    delete reservationData.adminId; 

    const result = await updateReservation(parseInt(reservationId, 10), reservationData, adminId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE 
router.delete('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const adminId = req.body.adminId; 
    if (!adminId) {
      return res.status(400).json({ error: 'adminId mungon në kërkesë' });
    }
    const result = await deleteReservation(parseInt(reservationId, 10), adminId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
