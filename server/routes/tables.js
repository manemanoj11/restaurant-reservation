const router = require('express').Router();
const Table = require('../models/Table');

// Seed Tables (Run this via Postman once to set up restaurant)
router.post('/seed', async (req, res) => {
  const tables = [
    { name: 'Table 1', capacity: 2 },
    { name: 'Table 2', capacity: 4 },
    { name: 'Table 3', capacity: 4 },
    { name: 'Table 4', capacity: 6 },
    { name: 'Table 5', capacity: 8 },
  ];
  await Table.insertMany(tables);
  res.json({ message: 'Tables seeded' });
});

router.get('/', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

module.exports = router;