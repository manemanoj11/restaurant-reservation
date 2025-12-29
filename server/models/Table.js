const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Table 1"
  capacity: { type: Number, required: true }, // e.g., 4
});

module.exports = mongoose.model('Table', tableSchema);
