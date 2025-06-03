const express = require('express');
const router = express.Router();
const {
  createReservationAdmin,
  getAllReservationsAdmin,
  getReservationAdminById,
  updateReservationAdmin,
  deleteReservationAdmin,
} = require('../models/reservation_AdminModel');

// CREATE
router.post('/', async (req, res) => {
  try {
    const result = await createReservationAdmin(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const results = await getAllReservationsAdmin();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ by reservationId + adminId
router.get('/:reservationId/:adminId', async (req, res) => {
  const { reservationId, adminId } = req.params;

  try {
    const result = await getReservationAdminById(
      parseInt(reservationId),
      parseInt(adminId)
    );
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// UPDATE
router.put('/:reservationId/:adminId', async (req, res) => {
  const { reservationId, adminId } = req.params;
  const { updatedBy } = req.body;

  try {
    const result = await updateReservationAdmin(
      parseInt(reservationId),
      parseInt(adminId),
      updatedBy
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:reservationId/:adminId', async (req, res) => {
  const { reservationId, adminId } = req.params;

  try {
    const result = await deleteReservationAdmin(
      parseInt(reservationId),
      parseInt(adminId)
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
