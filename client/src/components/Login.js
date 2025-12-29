import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      onLogin({ ...res.data.user, token: res.data.token });
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      alert('User created! Now log in.');
      setTab('login');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert('Register failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setTab('login')} style={{ flex: 1, padding: '10px', background: tab === 'login' ? '#007bff' : '#eee', color: tab === 'login' ? '#fff' : '#000', border: 'none', cursor: 'pointer' }}>Login</button>
        <button onClick={() => setTab('register')} style={{ flex: 1, padding: '10px', background: tab === 'register' ? '#007bff' : '#eee', color: tab === 'register' ? '#fff' : '#000', border: 'none', cursor: 'pointer' }}>Register</button>
      </div>

      {tab === 'login' && (
        <form onSubmit={handleLogin}>
          <h3>Login</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
        </form>
      )}

      {tab === 'register' && (
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Register</button>
        </form>
      )}
    </div>
  );
}
