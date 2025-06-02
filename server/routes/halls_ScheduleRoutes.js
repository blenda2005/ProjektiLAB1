//
//const express = require('express');
//const router = express.Router();
//
//const {
//  createHallSchedule,
//  getAllHallSchedules,
//  getHallSchedule,
//  deleteHallSchedule
//} = require('../models/halls_ScheduleModel'); 
//
//// CREATE - lidh një sallë me një orar
//router.post('/', async (req, res) => {
//  try {
//    const { hallsId, scheduleId } = req.body;
//    if (!hallsId || !scheduleId) {
//      return res.status(400).json({ error: 'hallsId and scheduleId are required' });
//    }
//
//    const result = await createHallSchedule(hallsId, scheduleId);
//    res.status(201).json(result);
//  } catch (err) {
//    console.error('Error creating HallSchedule:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// READ ALL - merr të gjitha lidhjet halls_schedule
//router.get('/', async (req, res) => {
//  try {
//    const result = await getAllHallSchedules();
//    res.json(result);
//  } catch (err) {
//    console.error('Error fetching HallSchedules:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// READ ONE - merr lidhjen halls_schedule për hallsId dhe scheduleId specifikë
//router.get('/:hallsId/:scheduleId', async (req, res) => {
//  try {
//    const { hallsId, scheduleId } = req.params;
//    const result = await getHallSchedule(parseInt(hallsId), parseInt(scheduleId));
//    if (!result) {
//      return res.status(404).json({ error: 'HallSchedule not found' });
//    }
//    res.json(result);
//  } catch (err) {
//    console.error('Error fetching HallSchedule:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//// DELETE - fshin lidhjen halls_schedule
//router.delete('/:hallsId/:scheduleId', async (req, res) => {
//  try {
//    const { hallsId, scheduleId } = req.params;
//    await deleteHallSchedule(parseInt(hallsId), parseInt(scheduleId));
//    res.json({ message: 'HallSchedule deleted successfully' });
//  } catch (err) {
//    console.error('Error deleting HallSchedule:', err);
//    res.status(500).json({ error: err.message });
//  }
//});
//
//module.exports = router;
//