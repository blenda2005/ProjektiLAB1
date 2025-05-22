const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../models/eventsModel');

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

// GET event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event', details: err.message });
  }
});

// CREATE event
router.post('/', async (req, res) => {
  try {
    const result = await createEvent(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

// UPDATE event
router.put('/:id', async (req, res) => {
  try {
    const result = await updateEvent(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteEvent(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event', details: err.message });
  }
});

module.exports = router;
