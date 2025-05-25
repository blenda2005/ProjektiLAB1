const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router  = express.Router();

const {
     createSchedule,
     getAllSchedules,
     getScheduleById,
     updateSchedule,
     deleteSchedule} = require('../models/scheduleModel');


function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors : errors.array()
      });
    }
    next();
  }
  
 
  const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);



const scheduleValidators = [
  body('date')
    .isISO8601().withMessage('date must be YYYY-MM-DD'),
  body('status')
    .trim().notEmpty().withMessage('status is required'),
  body('time')
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/).withMessage('time must be HH:MM'),
  body('price')
    .isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('createdBy')
    .trim().notEmpty().withMessage('createdBy is required')
];



// CREATE
router.post(
    '/',
    [...scheduleValidators, validateRequest],
    asyncHandler(async (req, res) => {
      await createSchedule(req.body);
      res.status(201).json({ message: 'Schedule created successfully' });
    })
  );
  
  // READ ALL
router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const schedules = await getAllSchedules();
      res.json({ data: schedules });
    })
  );
  
  // READ BY ID
router.get(
    '/:id',
    [
      param('id')
        .isInt({ gt: 0 })
        .withMessage('scheduleId must be a positive integer'),validateRequest
    ],
    asyncHandler(async (req, res) => {
      const scheduleId = +req.params.id;
      const schedule   = await getScheduleById(scheduleId);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json({ data: schedule });
    })
  );

  // UPDATE
  router.put(
    '/:id',
    [
      param('id').isInt({ gt: 0 }),
      body('date').optional().isISO8601(),
      body('status').optional().trim().notEmpty(),
      body('time').optional().matches(/^([0-1]\d|2[0-3]):[0-5]\d$/),
      body('price').optional().isFloat({ min: 0 }),
      body('updatedBy').trim().notEmpty().withMessage('updatedBy is required'),
      validateRequest
    ],
    asyncHandler(async (req, res) => {
      await updateSchedule(+req.params.id, req.body);
      res.json({ message: 'Schedule updated successfully' });
    })
  );

  // DELETE
router.delete(
    '/:id',
    [
      param('id')
        .isInt({ gt: 0 })
        .withMessage('scheduleId must be a positive integer'),
      validateRequest
    ],
    asyncHandler(async (req, res) => {
      await deleteSchedule(+req.params.id);
      res.json({ message: 'Schedule deleted successfully' });
    })
  );
  
  module.exports = router;
  