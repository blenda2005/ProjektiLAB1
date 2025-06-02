const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const {
    createHalls,
    getAllHalls,
    getHallsById,
    updateHalls,
    deleteHalls
  } = require('../models/hallsModel');


 
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
  
  
  const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


  const allowedTypes = ['2D', '3D', 'IMAX', 'VIP'];
  const hallsValidators = [
    body('type')
      .isIn(allowedTypes)
      .withMessage(`Type must be one of ${allowedTypes.join(', ')}`),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('capacity')
      .isInt({ gt: 0 })
      .withMessage('Capacity must be a positive integer'),
    body('cinemaId')
      .isInt({ gt: 0 })
      .withMessage('cinemaId must be a positive integer')
  ];

  //create 
  router.post(
    '/',
    [...hallsValidators, validateRequest],
    asyncHandler(async (req, res) => {
      const { type, name, capacity, cinemaId } = req.body;
      await createHalls(type, name, capacity, cinemaId);
      res.status(201).json({ message: 'Hall created successfully' });
    })
  );

//read all
router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const halls = await getAllHalls();
      res.json({ data: halls });
    }));

    //read by id
    router.get(
        '/:id',
        [
          param('id')
            .isInt({ gt: 0 })
            .withMessage('hallsId must be a positive integer'),
          validateRequest
        ],
        asyncHandler(async (req, res) => {
          const hallsId = +req.params.id;
          const hall = await getHallsById(hallsId);
          if (!hall) return res.status(404).json({ error: 'Hall not found' });
          res.json({ data: hall });
        })
      );
  
      //update
      router.put(
        '/:id',
        [
          param('id')
            .isInt({ gt: 0 })
            .withMessage('hallsId must be a positive integer'),
          ...hallsValidators,
          validateRequest
        ],
        asyncHandler(async (req, res) => {
          const hallsId = +req.params.id;
          const { type, name, capacity, cinemaId } = req.body;
          await updateHalls(hallsId, type, name, capacity, cinemaId);
          res.json({ message: 'Hall updated successfully' });
        })
      ); 

  //delete
  router.delete(
    '/:id',
    [
      param('id')
        .isInt({ gt: 0 })
        .withMessage('hallsId must be a positive integer'),
      validateRequest
    ],
    asyncHandler(async (req, res) => {
      const hallsId = +req.params.id;
      await deleteHalls(hallsId);
      res.json({ message: 'Hall deleted successfully' });
    })
  );
  
  module.exports = router;