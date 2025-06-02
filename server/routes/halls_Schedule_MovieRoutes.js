const express = require('express');
const router = express.Router();

const {
  createHallScheduleMovie,
  getMoviesByHallSchedule,
  getAllHallScheduleMovies,
  deleteHallScheduleMovie
} = require('../models/halls_Schedule_MovieModel');



// CREATE 
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

// READ ALL 
router.get('/', async (req, res) => {
  try {
    const allLinks = await getAllHallScheduleMovies();
    res.json(allLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ 
router.get('/:hallsId/:scheduleId', async (req, res) => {
  try {
    const hallsId = parseInt(req.params.hallsId);
    const scheduleId = parseInt(req.params.scheduleId);
    if (isNaN(hallsId) || isNaN(scheduleId)) {
      return res.status(400).json({ error: 'Parametrat hallsId dhe scheduleId duhet të jenë numra' });
    }

    const movies = await getMoviesByHallSchedule(hallsId, scheduleId);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE sipas 3 idve
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
