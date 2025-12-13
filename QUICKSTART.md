# 🚀 Quick Start Guide

## Installation & Setup (First Time Only)

```bash
cd /home/haokha/workspace/lensy-cam
npm install
cd client && npm install && cd ..
cp .env.example .env
```

## Running the Application

### Start Development Server
```bash
npm run dev
```
Opens at: http://localhost:3000

### Login
- Username: `admin`
- Password: `admin123`

## Common Tasks

### Add New Camera
1. Click "Cameras" → "+ Add Camera"
2. Fill: Name, Brand, Model, Category, Daily Rate
3. Click "Create"

### Create Rental
1. Click "Rentals" → "+ New Rental"
2. Select Customer & Camera
3. Set dates & rate
4. Click "Create Rental"

### Return Camera
1. Go to "Rentals"
2. Find active rental
3. Click "Return"

### Add Customer
1. Click "Customers" → "+ Add Customer"
2. Enter: Name, Phone (required)
3. Optionally: Email, Address, ID Number
4. Click "Create"

## File Locations

- **Database:** `rental.db` (auto-created)
- **Config:** `.env`
- **Server:** `server/index.js`
- **Frontend:** `client/src/`

## Stopping the Server

Press `Ctrl + C` in the terminal

## Troubleshooting

**Can't login?**
- Check `.env` file exists
- JWT_SECRET must be set

**Port in use?**
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

**Database issues?**
- Restart server
- Check `rental.db` permissions

## Key Features

✅ Camera inventory tracking  
✅ Rental management with auto-calculation  
✅ Customer database  
✅ Revenue dashboard  
✅ Overdue rental alerts  
✅ Search & filter everything  

## Support

Check `USER_GUIDE.md` for detailed documentation.

---
**Ready to manage your camera rental business! 📷**
