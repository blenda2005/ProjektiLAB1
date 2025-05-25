//const express = require('express');
//const router = express.Router();
//
//const {
//  createHallScheduleMovie,
//  getAllHallScheduleMovies,
//  getHallScheduleMovie,
//  deleteHallScheduleMovie
//} = require('../models/halls_Schedule_MovieModel');
//
//// CREATE
//router.post('/', async (req, res) => {
//  try {
//    const { hallsId, scheduleId, movieId } = req.body;
//    if (!hallsId || !scheduleId || !movieId) {
//      return res.status(400).json({ error: 'hallsId, scheduleId and movieId are required' });
//    }
//
//    const result = await createHallScheduleMovie(hallsId, scheduleId, movieId);
//    res.status(201).json(result);
//  } catch (err) {
//    console.error('Error creating HallScheduleMovie:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// READ ALL
//router.get('/', async (req, res) => {
//  try {
//    const result = await getAllHallScheduleMovies();
//    res.json(result);
//  } catch (err) {
//    console.error('Error fetching HallScheduleMovies:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// READ ONE
//router.get('/:hallsId/:scheduleId/:movieId', async (req, res) => {
//  try {
//    const { hallsId, scheduleId, movieId } = req.params;
//    const result = await getHallScheduleMovie(parseInt(hallsId), parseInt(scheduleId), parseInt(movieId));
//    if (!result) {
//      return res.status(404).json({ error: 'HallScheduleMovie not found' });
//    }
//    res.json(result);
//  } catch (err) {
//    console.error('Error fetching HallScheduleMovie:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// DELETE
//router.delete('/:hallsId/:scheduleId/:movieId', async (req, res) => {
//  try {
//    const { hallsId, scheduleId, movieId } = req.params;
//    await deleteHallScheduleMovie(parseInt(hallsId), parseInt(scheduleId), parseInt(movieId));
//    res.json({ message: 'HallScheduleMovie deleted successfully' });
//  } catch (err) {
//    console.error('Error deleting HallScheduleMovie:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//module.exports = router;
//


const express = require('express');
const router = express.Router();

const {
  createHallScheduleMovie,
  getMoviesByHallSchedule,
  deleteHallScheduleMovie
} = require('../models/halls_Schedule_MovieModel');

// CREATE - lidhje halls-schedule-movie
router.post('/', async (req, res) => {
  try {
    const { hallsId, scheduleId, movieId } = req.body;
    if (!hallsId || !scheduleId || !movieId) {
      return res.status(400).json({ error: 'hallsId, scheduleId dhe movieId janë të detyrueshme' });
    }
    const result = await createHallScheduleMovie(hallsId, scheduleId, movieId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - merr filma sipas hallsId dhe scheduleId
router.get('/:hallsId/:scheduleId', async (req, res) => {
  try {
    const { hallsId, scheduleId } = req.params;
    const movies = await getMoviesByHallSchedule(parseInt(hallsId), parseInt(scheduleId));
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - fshij lidhjen halls-schedule-movie
router.delete('/', async (req, res) => {
  try {
    const { hallsId, scheduleId, movieId } = req.body;
    if (!hallsId || !scheduleId || !movieId) {
      return res.status(400).json({ error: 'hallsId, scheduleId dhe movieId janë të detyrueshme' });
    }
    const result = await deleteHallScheduleMovie(hallsId, scheduleId, movieId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
