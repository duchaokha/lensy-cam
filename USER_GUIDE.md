# LensyCam - Camera Rental Management System

## 🎯 Overview

LensyCam is a comprehensive camera rental management system built for small camera rental businesses. It helps you manage your inventory, track rentals, maintain customer records, and monitor your business performance.

## ✨ Core Features

### 📷 Camera Inventory Management
- Add, edit, and delete camera equipment
- Track camera details: brand, model, serial number, condition
- Set daily rental rates and purchase information
- Monitor camera availability status
- Filter and search cameras by status, category, or name
- Categories: DSLR, Mirrorless, Cinema, Action, Drone, Lens, Accessories

### 📋 Rental Management
- Create and manage rentals with automatic calculations
- Track rental periods and due dates
- Monitor active, completed, and cancelled rentals
- Automatic overdue detection with visual alerts
- Record deposits and payment information
- Quick return functionality for completed rentals
- Prevent deletion of cameras with active rentals

### 👥 Customer Database
- Maintain comprehensive customer records
- Store contact information and ID details
- View customer rental history
- Search customers by name, email, or phone
- Add notes for special requirements

### 📊 Dashboard & Analytics
- Real-time business statistics
- Revenue tracking (total, monthly, yearly)
- Camera availability overview
- Active and overdue rental monitoring
- Monthly revenue trends (6-month history)
- Quick access to active rentals

### 🔒 Security & Authentication
- Secure JWT-based authentication
- Password protection with bcrypt encryption
- Session management
- Protected API endpoints

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (cross-platform, no setup needed)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **CSS3** - Responsive styling
- **Fetch API** - HTTP requests

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm installed
- Works on macOS, Windows, and Linux

### Quick Start

1. **Clone or navigate to the project directory:**
```bash
cd /home/haokha/workspace/lensy-cam
```

2. **Run the setup script (Linux/macOS):**
```bash
./setup.sh
```

Or manually:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Copy environment file
cp .env.example .env
```

3. **Start the application:**
```bash
npm run dev
```

The application will open automatically at http://localhost:3000

## 🚀 Running the Application

### Development Mode (Both frontend & backend)
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Individual Components
```bash
# Run only backend
npm run server

# Run only frontend
npm run client
```

## 🔐 Default Credentials

**Username:** `admin`  
**Password:** `admin123`

⚠️ **Important:** Change the default password after first login!

## 📁 Project Structure

```
lensy-cam/
├── server/                  # Backend code
│   ├── index.js            # Express server
│   ├── database.js         # Database connection & schema
│   ├── middleware/         # Authentication middleware
│   └── routes/             # API endpoints
│       ├── auth.js         # Authentication routes
│       ├── cameras.js      # Camera CRUD operations
│       ├── customers.js    # Customer management
│       ├── rentals.js      # Rental operations
│       └── dashboard.js    # Statistics & analytics
├── client/                  # Frontend React app
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API service layer
│       ├── context/        # React context (auth)
│       ├── App.js          # Main app component
│       └── index.css       # Global styles
├── rental.db               # SQLite database (auto-created)
├── package.json            # Backend dependencies
└── README.md              # This file
```

## 🗄️ Database Schema

### Users Table
- id, username, password (hashed), email, created_at

### Cameras Table
- id, name, brand, model, category, serial_number
- purchase_date, purchase_price, daily_rate
- status (available/rented/maintenance)
- condition (excellent/good/fair/poor)
- description, image_url, created_at

### Customers Table
- id, name, email, phone, address
- id_number, notes, created_at

### Rentals Table
- id, camera_id, customer_id
- start_date, end_date, actual_return_date
- daily_rate, total_amount, deposit
- status (active/completed/cancelled)
- notes, created_at

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=5000                    # Backend server port
JWT_SECRET=your-secret-key   # Change this for security!
NODE_ENV=development         # development or production
```

## 📱 Using the Application

### Adding a Camera
1. Navigate to "Cameras" in the sidebar
2. Click "+ Add Camera"
3. Fill in camera details (name, brand, model, category, daily rate)
4. Set condition and purchase information (optional)
5. Click "Create"

### Creating a Rental
1. Navigate to "Rentals"
2. Click "+ New Rental"
3. Select customer and camera
4. Set start and end dates
5. Confirm daily rate and add deposit if needed
6. Click "Create Rental"

The system automatically:
- Calculates total rental amount
- Updates camera status to "rented"
- Tracks rental period

### Returning Equipment
1. Go to "Rentals"
2. Find the active rental
3. Click "Return" button
4. Camera automatically becomes available again

### Managing Customers
1. Navigate to "Customers"
2. Add customer information
3. View rental history per customer
4. Edit or delete customer records

### Viewing Dashboard
- See real-time statistics
- Monitor revenue trends
- Track overdue rentals
- View active rental summary

## 🎨 Features Highlights

✅ **Responsive Design** - Works on desktop and mobile  
✅ **Real-time Updates** - Instant data refresh  
✅ **Overdue Detection** - Visual alerts for late returns  
✅ **Search & Filter** - Quick access to information  
✅ **Data Validation** - Prevents invalid operations  
✅ **Cross-platform** - Runs on macOS, Windows, Linux  
✅ **No External Database** - SQLite included  
✅ **Automatic Calculations** - Rental amounts computed automatically  

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Cameras
- `GET /api/cameras` - List all cameras
- `GET /api/cameras/:id` - Get single camera
- `POST /api/cameras` - Create camera
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer with rental history
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Rentals
- `GET /api/rentals` - List all rentals
- `GET /api/rentals/:id` - Get single rental
- `POST /api/rentals` - Create rental
- `PUT /api/rentals/:id` - Update rental
- `POST /api/rentals/:id/return` - Mark rental as returned
- `DELETE /api/rentals/:id` - Delete rental

### Dashboard
- `GET /api/dashboard/stats` - Get business statistics

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🛡️ Security Best Practices

1. **Change default password** immediately after first login
2. **Update JWT_SECRET** in .env file for production
3. **Use HTTPS** when deploying to production
4. **Regular backups** of rental.db file
5. **Keep dependencies updated** with `npm update`

## 🐛 Troubleshooting

### Port already in use
If port 3000 or 5000 is busy:
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database locked
If you get "database locked" errors:
- Close all other connections to rental.db
- Restart the server

### Cannot login
- Verify .env file exists
- Check JWT_SECRET is set
- Clear browser localStorage and try again

### Dependencies issues
```bash
# Clean install
rm -rf node_modules client/node_modules
rm package-lock.json client/package-lock.json
npm install
cd client && npm install
```

## 📈 Future Enhancements

Potential features for future versions:
- Equipment maintenance tracking
- Email notifications for overdue rentals
- Multi-user support with roles
- Invoice generation (PDF)
- Payment tracking and receipts
- Equipment reservation system
- Photo uploads for cameras
- Customer agreement signing
- Revenue reports and analytics
- Export data to CSV/Excel
- Mobile app version

## 📄 License

MIT License - Feel free to use and modify for your business needs.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Review server logs in terminal

## 🎉 Getting Started Checklist

- [ ] Install dependencies (`npm run install-all`)
- [ ] Copy .env file and set JWT_SECRET
- [ ] Start the application (`npm run dev`)
- [ ] Login with admin/admin123
- [ ] Change default password
- [ ] Add your first camera
- [ ] Add your first customer
- [ ] Create your first rental
- [ ] Explore the dashboard

---

**Built for small camera rental businesses to efficiently manage equipment, customers, and rentals.**

Enjoy using LensyCam! 📷✨
