const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../models/usersModel');

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

// CREATE USER
router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('gender').trim().notEmpty().withMessage('Gender is required'),
    body('date_of_birth').isISO8601().toDate().withMessage('Valid date_of_birth is required'),
    body('address').optional().trim(),
    body('zipCode').optional().trim(),
    body('city').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('passwordHash').notEmpty().withMessage('PasswordHash is required'),
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['Admin', 'Client']).withMessage('Role must be Admin or Client'),
    body('cinemaId').optional().isInt({ gt: 0 }).withMessage('CinemaId must be a positive integer'),
    body('createdBy').optional().trim(),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const user = req.body;
    const result = await createUser(user);
    res.status(201).json({
      message: result.message,
      userId: result.userId
    });
  })
);

// READ ALL USERS
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await getAllUsers();
    res.json({ data: users });
  })
);

// READ USER BY ID
router.get(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  })
);

// UPDATE USER
router.put(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('gender').optional().trim(),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('address').optional().trim(),
    body('zipCode').optional().trim(),
    body('city').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('passwordHash').optional().notEmpty(),
    body('role').optional().isIn(['Admin', 'Client']).withMessage('Role must be Admin or Client'),
    body('updatedBy').optional().trim(),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userData = req.body;
    await updateUser(id, userData);
    res.status(200).json({ message: 'User updated successfully' });
  })
);

// DELETE USER
router.delete(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  })
);

module.exports = router;


//const express = require('express');
//const { body, param, validationResult } = require('express-validator');
//const router = express.Router();
//
//const {
//    createUsers,
//    getAllUsers,
//    getUsersById,
//    updateUsers,
//    deleteUsers 
//} = require('../models/usersModel');
//
//// funksion per validimin e rezultateve nga express-validator - kontrollon gabimet
//function validateRequest(req, res, next) {
//  const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(400).json({
//      message: 'Validation failed',
//      errors: errors.array()
//    });
//  }
//  next();
//}
//// per te shmangur try catch - kap qdo gabim
//const asyncHandler = fn => (req, res, next) =>
//  Promise.resolve(fn(req, res, next)).catch(next);  
//// CREATE
//router.post(
//    '/',
//    [
//        body('firstName').trim().notEmpty().withMessage('First name is required'),
//        body('lastName').trim().notEmpty().withMessage('Last name is required'),
//        body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
//        body('passwordHash').notEmpty().withMessage('Password hash is required'),
//        validateRequest
//    ],
//    asyncHandler(async (req, res) => {
//        const { firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy } = req.body;
//        await createUsers(firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy);
//        res.status(201).json({ message: 'User created successfully' });
//    })
//);
//// READ ALL
//router.get(
//  '/',
//  asyncHandler(async (req, res) => {
//    const users = await getAllUsers();
//    res.json({ data: users });
//  })
//);
//// READ BY ID
//router.get(
//  '/:id',
//  [
//    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
//    validateRequest
//  ],
//  asyncHandler(async (req, res) => {
//    const user = await getUsersById(req.params.id);
//    if (!user) {
//      return res.status(404).json({ message: 'User not found' });
//    }
//    res.json({ data: user });
//  })
//);
//// UPDATE
//router.put(
//  '/:id',
//  [
//    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
//    // Optional fields for update
//    body('firstName').optional().trim(),
//    body('lastName').optional().trim(),
//    body('gender').optional().trim(),
//    body('date_of_birth').optional().isISO8601(),
//    body('address').optional().trim(),
//    body('zipCode').optional().trim(),
//    body('city').optional().trim(),
//    body('phoneNumber').optional().trim(),
//    body('passwordHash').optional(),
//    body('cinemaId').optional().isInt(),
//    body('updatedBy').optional().trim(),
//    validateRequest
//  ],
//  asyncHandler(async (req, res) => {
//    await updateUsers(req.params.id, req.body);
//    res.status(200).json({ message: 'User updated successfully' });
//  })
//);
//// DELETE
//router.delete(
//  '/:id',
//  [
//    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
//    validateRequest
//  ],
//  asyncHandler(async (req, res) => {
//    await deleteUsers(req.params.id);
//    res.status(200).json({ message: 'User deleted successfully' });
//  })
//);
//module.exports = router;
