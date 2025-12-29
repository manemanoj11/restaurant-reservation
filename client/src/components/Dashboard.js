import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ user }) {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ date: '', time: '18:00', guests: 2 });
  
  const token = user.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reservations', config);
      console.log('Fetched reservations:', res.data);
      setReservations(res.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reservations', 
        { ...form, customerName: user.name }, config
      );
      alert('Booked!');
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error booking');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel reservation?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`, config);
      fetchReservations();
    } catch (err) {
      alert('Error cancelling');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>{['admin', 'manager', 'staff'].includes(user.role) ? 'All Reservations' : 'My Reservations'}</h3>

      {/* Booking Form - Only for customers */}
      {user.role === 'customer' && (
        <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          <h4>Make a Reservation</h4>
          <form onSubmit={handleBook} style={{ display: 'flex', gap: '10px' }}>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
            </select>
            <input type="number" min="1" value={form.guests} onChange={e => setForm({...form, guests: e.target.value})} style={{ width: '60px' }} />
            <button type="submit">Book</button>
          </form>
        </div>
      )}

      {/* Reservation List */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Table</th>
            {['admin', 'manager', 'staff'].includes(user.role) && <th>Customer</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res._id}>
              <td>{res.date}</td>
              <td>{res.time}</td>
              <td>{res.tableName}</td>
              {['admin', 'manager', 'staff'].includes(user.role) && <td>{res.customerName}</td>}
              <td>
                <button onClick={() => handleCancel(res._id)} style={{ color: 'red' }}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
