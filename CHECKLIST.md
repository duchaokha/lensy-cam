# ✅ Getting Started Checklist

Use this checklist to get up and running with LensyCam!

---

## 📦 Initial Setup (One-Time)

- [ ] Navigate to project directory: `cd /home/haokha/workspace/lensy-cam`
- [ ] Install backend dependencies: `npm install`
- [ ] Install frontend dependencies: `cd client && npm install && cd ..`
- [ ] Verify `.env` file exists (contains JWT_SECRET)
- [ ] Review README.md for overview

**Time: ~5 minutes** ⏱️

---

## 🚀 First Launch

- [ ] Start the application: `npm run dev`
- [ ] Wait for "Compiled successfully" message
- [ ] Browser should auto-open to http://localhost:3000
- [ ] You should see the login screen

**Time: ~2 minutes** ⏱️

---

## 🔐 Initial Login & Security

- [ ] Login with username: `admin`
- [ ] Login with password: `admin123`
- [ ] You should see the Dashboard
- [ ] **IMPORTANT:** Go to user menu and change password
- [ ] Update `.env` JWT_SECRET to a random string (production only)

**Time: ~1 minute** ⏱️

---

## 📷 Add Your First Camera

- [ ] Click "Cameras" in the sidebar
- [ ] Click "+ Add Camera" button
- [ ] Fill in required fields:
  - [ ] Camera Name (e.g., "Canon EOS R5")
  - [ ] Brand (e.g., "Canon")
  - [ ] Model (e.g., "EOS R5")
  - [ ] Category (select from dropdown)
  - [ ] Daily Rental Rate (e.g., "50.00")
- [ ] Optional fields:
  - [ ] Serial Number
  - [ ] Purchase Date
  - [ ] Purchase Price
  - [ ] Condition (default: Excellent)
  - [ ] Description
- [ ] Click "Create"
- [ ] Camera should appear in the list

**Time: ~2 minutes** ⏱️

---

## 👥 Add Your First Customer

- [ ] Click "Customers" in the sidebar
- [ ] Click "+ Add Customer" button
- [ ] Fill in required fields:
  - [ ] Full Name (e.g., "John Doe")
  - [ ] Phone (e.g., "+1 234-567-8900")
- [ ] Optional fields:
  - [ ] Email
  - [ ] Address
  - [ ] ID Number (driver's license, etc.)
  - [ ] Notes
- [ ] Click "Create"
- [ ] Customer should appear in the list

**Time: ~2 minutes** ⏱️

---

## 📋 Create Your First Rental

- [ ] Click "Rentals" in the sidebar
- [ ] Click "+ New Rental" button
- [ ] Select customer from dropdown
- [ ] Select camera from dropdown (only available cameras shown)
- [ ] Set start date (default: today)
- [ ] Set end date
- [ ] Verify daily rate is correct
- [ ] Add deposit if needed (optional)
- [ ] Add notes if needed (optional)
- [ ] Click "Create Rental"
- [ ] Rental should appear in the list
- [ ] Camera status should change to "Rented"

**Time: ~2 minutes** ⏱️

---

## 📊 Explore the Dashboard

- [ ] Click "Dashboard" in the sidebar
- [ ] Verify statistics are showing:
  - [ ] Total Revenue (should show your rental amount)
  - [ ] Total Cameras (should show 1)
  - [ ] Available Cameras (should show 0)
  - [ ] Currently Rented (should show 1)
  - [ ] Active Rentals (should show 1)
- [ ] Check "Active Rentals" section shows your rental
- [ ] Check "Monthly Revenue Trend" section

**Time: ~1 minute** ⏱️

---

## 🔄 Complete a Rental Cycle

- [ ] Go back to "Rentals"
- [ ] Find your active rental
- [ ] Click "Return" button
- [ ] Confirm the return
- [ ] Status should change to "Completed"
- [ ] Go to "Cameras"
- [ ] Verify camera status is now "Available" again
- [ ] Go to "Dashboard"
- [ ] Verify statistics updated

**Time: ~1 minute** ⏱️

---

## 📚 Read Documentation

- [ ] Read QUICKSTART.md (2 min)
- [ ] Skim USER_GUIDE.md (15 min)
- [ ] Browse FEATURES.md to see all capabilities
- [ ] Check VISUAL_GUIDE.md for interface details
- [ ] Bookmark DEPLOYMENT.md for when ready for production

**Time: ~20 minutes** ⏱️

---

## 🎯 Import Your Business Data

Now that you know how it works, add your real data:

### Cameras
- [ ] List all your cameras on paper
- [ ] Add each camera one by one
- [ ] Set realistic daily rates
- [ ] Add serial numbers for tracking
- [ ] Set correct condition status

### Customers
- [ ] Import existing customer list
- [ ] Add contact information
- [ ] Include ID numbers for verification
- [ ] Add any special notes

### Existing Rentals (if applicable)
- [ ] Create rentals for equipment currently out
- [ ] Set correct dates
- [ ] Mark any overdue rentals

**Time: Varies based on inventory size**

---

## 🔒 Production Preparation (Before Going Live)

- [ ] Change admin password to something strong
- [ ] Update JWT_SECRET in .env to random 32+ character string
- [ ] Test all features thoroughly
- [ ] Set up regular backups (see DEPLOYMENT.md)
- [ ] Read security section in USER_GUIDE.md
- [ ] Consider deployment options (DEPLOYMENT.md)

**Time: ~30 minutes** ⏱️

---

## 📱 Daily Operations Checklist

Once you're running, daily tasks:

- [ ] Check Dashboard for overdue rentals
- [ ] Review active rentals
- [ ] Process new rental requests
- [ ] Mark returns as completed
- [ ] Update equipment status if needed
- [ ] Check revenue statistics

**Time: ~5-10 minutes per day** ⏱️

---

## 🛟 Emergency Procedures

### If something goes wrong:

**Application won't start:**
- [ ] Check terminal for error messages
- [ ] Verify ports 3000 and 8899 are free
- [ ] Try restarting: `Ctrl+C` then `npm run dev` again

**Can't login:**
- [ ] Verify .env file exists
- [ ] Check JWT_SECRET is set
- [ ] Clear browser cache/localStorage
- [ ] Try in incognito window

**Database error:**
- [ ] Stop the server (Ctrl+C)
- [ ] Check rental.db file exists and has permissions
- [ ] Restart the server

**Lost data:**
- [ ] Restore from backup (rental.db file)
- [ ] Check USER_GUIDE.md troubleshooting section

---

## 💡 Tips for Success

- [ ] Backup rental.db file regularly (daily recommended)
- [ ] Use consistent naming for cameras (Brand + Model)
- [ ] Always record ID numbers for customers
- [ ] Set deposits for expensive equipment
- [ ] Check dashboard daily for overdue rentals
- [ ] Keep equipment descriptions detailed
- [ ] Update camera condition after each rental

---

## 🎉 You're Done!

When you've completed this checklist, you'll:

✅ Have the application running  
✅ Know how to use all core features  
✅ Have test data to practice with  
✅ Understand the workflow  
✅ Be ready to import real data  
✅ Know where to find help  

---

## 📞 Need Help?

1. Check USER_GUIDE.md troubleshooting section
2. Review QUICKSTART.md for common tasks
3. Look at VISUAL_GUIDE.md for interface help
4. Check browser console for errors (F12)
5. Review terminal output for server errors

---

## ⏱️ Total Time Investment

- **Initial Setup:** ~15 minutes
- **Learning the System:** ~30 minutes
- **Data Import:** Varies (1-4 hours depending on inventory)
- **Daily Operations:** 5-10 minutes

**You'll be productive in under an hour!**

---

**Start with the first section and work your way down. Check items off as you complete them. Good luck! 🚀**
