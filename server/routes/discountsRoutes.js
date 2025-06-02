const express = require('express');
const router = express.Router();
const discountModel = require('../models/discountsModel'); 

// CREATE
router.post('/', async (req, res) => {
  try {
    const discountData = req.body;
    const result = await discountModel.createDiscount(discountData);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në krijimin e zbritjes' });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const discounts = await discountModel.getAllDiscounts();
    res.json(discounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në marrjen e zbritjeve' });
  }
});

// READ BY ID
router.get('/:id', async (req, res) => {
  try {
    const discount = await discountModel.getDiscountById(parseInt(req.params.id));
    if (!discount) {
      return res.status(404).json({ message: 'Zbritja nuk u gjet' });
    }
    res.json(discount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në marrjen e zbritjes' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const discountId = parseInt(req.params.id);
    const discountData = req.body;
    await discountModel.updateDiscount(discountId, discountData);
    res.json({ message: 'Zbritja u përditësua me sukses' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në përditësimin e zbritjes' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const discountId = parseInt(req.params.id);
    await discountModel.deleteDiscount(discountId);
    res.json({ message: 'Zbritja u fshi me sukses' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në fshirjen e zbritjes' });
  }
});

module.exports = router;
