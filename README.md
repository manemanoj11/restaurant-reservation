# Restaurant Reservation Management System

## Overview
A full-stack MERN application that allows customers to book restaurant tables and administrators to manage reservations. The system prevents double bookings and ensures table capacity matches guest count.

## Tech Stack
- **Frontend**: React 19, React Router, Axios
- **Backend**: Node.js, Express 5, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt password hashing

## Features

### Customer Features
- Register and login
- View available time slots and create reservations
- View their own reservations
- Cancel own reservations
- Real-time availability checking

### Staff/Manager Features
- View all customer reservations
- Cancel any reservation
- See customer names with reservations

### Admin Features
- Full access to all reservations
- User and reservation management
- Table management

## Project Structure

```
restaurant-reservation/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js (Auth & registration)
│   │   │   └── Dashboard.js (Role-based views)
│   │   ├── App.js (Routing & auth)
│   │   └── index.js (Entry point)
│   └── package.json
├── server/
│   ├── routes/
│   │   ├── auth.js (Login/Register)
│   │   ├── reservations.js (Booking logic)
│   │   └── tables.js (Table management)
│   ├── models/
│   │   ├── User.js (Customer/Staff/Manager/Admin)
│   │   ├── Reservation.js (Booking record)
│   │   └── Table.js (Restaurant tables)
│   ├── middleware/
│   │   └── auth.js (JWT verification)
│   ├── index.js (Server entry)
│   ├── .env (Environment variables)
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd restaurant-reservation
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   
   Create `.env` file in `server/` directory:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app>
   JWT_SECRET=your_secret_key_here
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Seed Restaurant Tables**
   ```bash
   curl -X POST http://localhost:5000/api/tables/seed
   ```

5. **Start the Application**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   node index.js
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm start
   ```

6. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Reservation & Availability Logic

### How Reservations Work
1. Customer selects date, time, and number of guests
2. System queries all tables with sufficient capacity
3. System checks for existing reservations at that date/time
4. First available table is assigned
5. If no tables available, returns 400 error

### Validation Rules
- **Capacity Check**: System finds tables with `capacity >= guests` requested
- **Conflict Prevention**: Prevents booking same table at same date/time
- **Error Handling**: Returns meaningful error messages for:
  - No suitable tables
  - No available tables at requested time
  - Invalid reservations

### Database Queries
```javascript
// Find suitable tables
const suitableTables = await Table.find({ capacity: { $gte: guests } });

// Check existing bookings
const existingBookings = await Reservation.find({ date, time });

// Find available table (first come, first served)
const availableTable = suitableTables.find(t => 
  !bookedTableIds.includes(t._id.toString())
);
```

## Role-Based Access Control

### Role Hierarchy
| Role | Permissions |
|------|-------------|
| **Customer** | Create own reservation, view own, cancel own |
| **Staff** | View all reservations, cancel any |
| **Manager** | View all reservations, cancel any |
| **Admin** | Full access (all operations) |

### Authorization Flow
1. User registers with email, password, and role
2. JWT token includes user ID and role
3. `auth` middleware verifies token and extracts role
4. Endpoints check role before granting access
5. Unauthorized requests return 403 Forbidden

### API Authorization Examples
```javascript
// Staff can see all reservations
if (!['admin', 'manager', 'staff'].includes(req.user.role)) {
  query.userId = req.user.id; // Only own reservations
}

// Staff can delete any reservation
if (!['admin', 'manager', 'staff'].includes(req.user.role) && 
    reservation.userId.toString() !== req.user.id) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user

### Reservations
- `GET /api/reservations` - View reservations (role-filtered)
- `POST /api/reservations` - Create reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables/seed` - Initialize restaurant tables

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['customer', 'staff', 'manager', 'admin']
}
```

### Table
```javascript
{
  name: String,        // e.g., "Table 1"
  capacity: Number     // e.g., 4
}
```

### Reservation
```javascript
{
  date: String,              // YYYY-MM-DD
  time: String,              // HH:MM
  guests: Number,
  customerName: String,
  userId: ObjectId,          // Reference to User
  table: ObjectId,           // Reference to Table
  tableName: String,
  timestamps: true           // createdAt, updatedAt
}
```

## Known Limitations

1. **No Real-Time Updates**: Multiple simultaneous bookings may cause race conditions
2. **Limited Time Slots**: Fixed 17:00-20:00 slots (no flexibility)
3. **No Notifications**: Users don't receive confirmation emails
4. **No Payment Integration**: No billing system
5. **Single Restaurant**: System assumes one restaurant location
6. **No Cancellation Policies**: Instant cancellation without penalties
7. **No Waitlist**: No support for fully booked slots
8. **Basic UI**: Minimal styling, focus on functionality

## Areas for Improvement

### Short Term
- [ ] Add email confirmation for reservations
- [ ] Implement cancellation time limits
- [ ] Add reservation notes/special requests
- [ ] Implement waitlist for full slots
- [ ] Add date range filtering for admin

### Medium Term
- [ ] Real-time availability via WebSockets
- [ ] SMS/Email notifications
- [ ] Payment processing integration
- [ ] Reservation modifications (not just cancel)
- [ ] Bulk operations for admins
- [ ] Analytics dashboard

### Long Term
- [ ] Multi-location support
- [ ] Loyalty program
- [ ] Dynamic pricing
- [ ] AI-based recommendations
- [ ] Mobile app (React Native)

## Testing

### Test Users
Register with these credentials:
- **Customer**: email: `customer@test.com` | role: customer
- **Staff**: email: `staff@test.com` | role: staff
- **Admin**: email: `admin@test.com` | role: admin

### Manual Testing Steps
1. Register as customer
2. Create a reservation
3. Register as staff
4. View all reservations (including customer's)
5. Try cancelling customer's reservation (should succeed)
6. Register as customer and cancel own reservation (should succeed)

## Deployment

### Recommended Platforms
- **Frontend**: Vercel, Netlify (React apps)
- **Backend**: Render, Railway, Heroku (Node.js apps)
- **Database**: MongoDB Atlas (free tier available)

### Deployment Steps (Render)

**Backend:**
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy

**Frontend:**
1. Update API_URL in client code to deployed backend
2. Deploy to Vercel/Netlify

## Assumptions Made

1. **Single Restaurant**: System manages one restaurant only
2. **Fixed Tables**: Tables are predefined and not created dynamically by users
3. **One Slot per Customer**: Customers can have multiple reservations on different dates
4. **First-Come, First-Served**: Tables assigned based on availability order
5. **No Overbooking**: System strictly prevents double bookings
6. **Email Uniqueness**: Each user email is unique
7. **UTC Dates**: All dates stored as YYYY-MM-DD strings
8. **Time Slots**: Limited to 17:00, 18:00, 19:00, 20:00

## Troubleshooting

### Server won't start
- Check `.env` file has `MONGO_URI`
- Verify MongoDB connection string
- Ensure port 5000 is not in use

### Client shows empty reservations
- Verify user is logged in
- Check network tab for API errors
- Ensure backend is running

### Registration fails
- Check email isn't already registered
- Verify all fields are filled
- Check server logs for validation errors

---

**Last Updated**: December 29, 2025
