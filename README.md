# 📷 LensyCam - Camera Rental Management System

> **A complete, production-ready solution for managing your camera rental business**

Built specifically for small camera rental businesses to efficiently manage equipment, customers, and rentals across **macOS, Windows, and Linux**.

---

## ✨ What You Get

A **fully functional web application** with:

✅ **Camera Inventory Management** - Track all your equipment  
✅ **Rental Management** - Create rentals with automatic calculations  
✅ **Customer Database** - Maintain customer records and history  
✅ **Analytics Dashboard** - Monitor revenue and business metrics  
✅ **Overdue Alerts** - Visual warnings for late returns  
✅ **Secure Authentication** - JWT-based login system  
✅ **Cross-Platform** - Works on any computer with Node.js  
✅ **No External Database** - SQLite included, zero configuration  

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Open Your Browser
The app will automatically open at: **http://localhost:3000**

### 4. Login
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Change the default password immediately after first login!**

---

## 📚 Documentation

This project includes comprehensive documentation:

- **[QUICKSTART.md](QUICKSTART.md)** - Fast reference guide (2 min read)
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete manual with API docs (15 min read)
- **[FEATURES.md](FEATURES.md)** - Full feature list and specifications
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Visual walkthrough of the interface
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

**Start here:** [QUICKSTART.md](QUICKSTART.md) → [USER_GUIDE.md](USER_GUIDE.md)

---

## 🎯 Core Features

### 📷 Camera Inventory
- Add/edit/delete cameras
- Track brand, model, serial number, condition
- Set daily rental rates and purchase info
- Search and filter (status, category, name)
- Categories: DSLR, Mirrorless, Cinema, Action, Drone, Lens, Accessories

### 📋 Rental Management
- Create rentals with automatic calculations
- Track start/end dates and status
- Monitor overdue rentals (visual alerts)
- Quick return functionality
- Record deposits and payments
- Prevent equipment deletion during active rentals

### 👥 Customer Database
- Store complete contact information
- View rental history per customer
- Search by name, email, or phone
- Track ID verification details
- Add custom notes

### 📊 Dashboard & Analytics
- Real-time business statistics
- Revenue tracking (total, monthly, yearly)
- Camera availability overview
- Active and overdue rental monitoring
- 6-month revenue trends
- Quick access to active rentals

---

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express.js
- SQLite database (embedded, no setup)
- JWT authentication + bcrypt encryption

**Frontend:**
- React 18 with React Router 6
- Custom responsive CSS
- Fetch API for HTTP requests

**Development:**
- Hot reload with nodemon
- Concurrent server/client execution
- Cross-platform compatibility

---

## 📁 Project Structure

```
lensy-cam/
├── server/              # Backend API
│   ├── index.js        # Express server
│   ├── database.js     # SQLite + schema
│   ├── middleware/     # Auth middleware
│   └── routes/         # API endpoints
├── client/             # React frontend
│   └── src/
│       ├── pages/      # Dashboard, Cameras, Rentals, Customers
│       ├── components/ # Sidebar, etc.
│       └── services/   # API client
├── rental.db          # SQLite database (auto-created)
└── *.md               # Documentation
```

---

## 🎮 Usage

### Add a Camera
1. Navigate to "Cameras"
2. Click "+ Add Camera"
3. Fill in details (name, brand, model, category, daily rate)
4. Click "Create"

### Create a Rental
1. Navigate to "Rentals"
2. Click "+ New Rental"
3. Select customer and camera
4. Set dates (amount auto-calculated)
5. Click "Create Rental"

### Return Equipment
1. Go to "Rentals"
2. Find active rental
3. Click "Return"

### View Analytics
- Dashboard shows all key metrics
- Revenue trends (6 months)
- Overdue rentals highlighted

---

## 🔐 Security

- ✅ Encrypted passwords (bcrypt)
- ✅ JWT authentication (24h expiration)
- ✅ Protected API endpoints
- ✅ SQL injection prevention
- ✅ XSS protection

**For production:** Update `JWT_SECRET` in `.env` file!

---

## 💾 Database

**Auto-created SQLite database** with 4 tables:
- **users** - Authentication
- **cameras** - Equipment inventory
- **customers** - Customer records
- **rentals** - Rental transactions

No external database server needed!

---

## 🌐 Cross-Platform

Works on:
- ✅ macOS (10.12+)
- ✅ Windows (10/11)
- ✅ Linux (Ubuntu, Debian, CentOS, etc.)

Runs in any modern browser!

---

## 📱 Responsive Design

- Desktop (full features)
- Tablet (optimized layout)
- Mobile (condensed view)

---

## 🎓 What's Next?

1. ✅ Run `npm run dev` to start
2. ✅ Login with default credentials
3. ✅ Change password
4. ✅ Add your cameras
5. ✅ Add customers
6. ✅ Create rentals
7. ✅ Monitor dashboard

**Read [USER_GUIDE.md](USER_GUIDE.md) for detailed instructions!**

---

## 🔧 Development Commands

```bash
npm run dev          # Start both server & client (development)
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start            # Run production server
```

---

## 🐛 Troubleshooting

**Can't start server?**
- Check if ports 3000/8899 are available
- Run `lsof -ti:8899 | xargs kill -9` to free port

**Database issues?**
- Check `rental.db` permissions
- Restart the server

**Login problems?**
- Verify `.env` file exists
- Check `JWT_SECRET` is set

**More help:** See [USER_GUIDE.md](USER_GUIDE.md) troubleshooting section

---

## 📈 Roadmap / Future Ideas

- Multi-user support with roles
- Email notifications for due dates
- PDF invoice generation
- Photo uploads for equipment
- Mobile app version
- Payment gateway integration
- Advanced reporting

---

## 📄 License

MIT License - Free to use and modify for your business

---

## 🎉 You're Ready!

**Everything is set up and ready to use.**

1. All dependencies installed ✅
2. Database configured ✅
3. Default user created ✅
4. Documentation complete ✅

**Just run `npm run dev` and start managing your rentals!**

---

**Questions?** Check the comprehensive guides:
- [QUICKSTART.md](QUICKSTART.md) - Get started in 2 minutes
- [USER_GUIDE.md](USER_GUIDE.md) - Learn everything
- [FEATURES.md](FEATURES.md) - See all capabilities

**Built for camera rental businesses. Ready to deploy. Ready to use.** 📷✨
