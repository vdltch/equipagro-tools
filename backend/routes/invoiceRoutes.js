// routes/invoiceRoutes.js
const express = require('express');
const Invoice = require('../models/Invoice');
const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  const invoices = await Invoice.find();
  res.json(invoices);
});

// Create a new invoice
router.post('/', async (req, res) => {
  const newInvoice = new Invoice(req.body);
  await newInvoice.save();
  res.status(201).json(newInvoice);
});

// Update an invoice
router.put('/:id', async (req, res) => {
  const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedInvoice);
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
