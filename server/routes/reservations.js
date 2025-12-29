const router = require('express').Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const auth = require('../middleware/auth');

// Get Reservations
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    console.log('User role:', req.user.role, 'User ID:', req.user.id);
    // If not admin/manager/staff, only show own reservations
    if (!['admin', 'manager', 'staff'].includes(req.user.role)) {
      query.userId = req.user.id;
    }
    const reservations = await Reservation.find(query).sort({ date: 1, time: 1 });
    console.log('Found reservations:', reservations.length);
    res.json(reservations);
  } catch (err) {
    console.error('Reservations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create Reservation
router.post('/', auth, async (req, res) => {
  const { date, time, guests, customerName } = req.body;

  try {
    // 1. Find suitable tables
    const suitableTables = await Table.find({ capacity: { $gte: guests } });
    if (suitableTables.length === 0) {
      return res.status(400).json({ message: 'No table large enough for this party.' });
    }

    // 2. Check existing bookings for this date/time
    const existingBookings = await Reservation.find({ date, time });
    const bookedTableIds = existingBookings.map(b => b.table.toString());

    // 3. Find available table
    const availableTable = suitableTables.find(t => !bookedTableIds.includes(t._id.toString()));

    if (!availableTable) {
      return res.status(400).json({ message: 'No tables available at this time.' });
    }

    // 4. Create Reservation
    const newReservation = new Reservation({
      date,
      time,
      guests,
      customerName,
      userId: req.user.id,
      table: availableTable._id,
      tableName: availableTable.name
    });

    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Reservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Not found' });

    console.log('Delete attempt - User role:', req.user.role, 'Reservation userId:', reservation.userId.toString(), 'Req user id:', req.user.id);
    
    // Only allow Admin/Manager/Staff or the Owner to delete
    if (!['admin', 'manager', 'staff'].includes(req.user.role) && reservation.userId.toString() !== req.user.id) {
      console.log('Unauthorized - role not in list and not owner');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
