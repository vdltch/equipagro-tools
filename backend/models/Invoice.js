// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  clientName: String,
  amount: Number,
  dueDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
