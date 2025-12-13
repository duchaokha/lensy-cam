# 📸 LensyCam Visual Walkthrough

## 🎬 Application Flow Guide

---

## 1. 🔐 Login Screen

**What you'll see:**
- LensyCam logo and title
- Username field
- Password field  
- Login button
- Default credentials shown

**What to do:**
1. Enter username: `admin`
2. Enter password: `admin123`
3. Click "Login"

**Features:**
- Clean, centered design
- Gradient purple background
- White card with form
- Error messages if credentials wrong

---

## 2. 📊 Dashboard (Home Screen)

**What you'll see when logged in:**

### Top Section: Header
- Page title: "Dashboard"
- Subtitle: "Overview of your camera rental business"

### Statistics Grid (8 Cards):

**Card 1: Total Revenue** (Purple gradient)
- Large dollar amount
- "All time" label

**Card 2: This Month**
- Current month revenue
- "Monthly revenue" label

**Card 3: This Year**
- Current year revenue
- "Yearly revenue" label

**Card 4: Total Cameras**
- Count of all cameras
- "In inventory" label

**Card 5: Available**
- Available camera count
- "Ready to rent" label

**Card 6: Currently Rented**
- Rented camera count
- "Out on rental" label

**Card 7: Active Rentals**
- Active rental count
- "Ongoing" label

**Card 8: Overdue Rentals**
- Overdue count (red if > 0)
- "Need attention" label

### Middle Section: Revenue Trend
- Table showing last 6 months
- Columns: Month, Rentals, Revenue
- Shows monthly patterns

### Bottom Section: Active Rentals
- Table of current rentals
- Overdue rentals highlighted in yellow
- Columns: Camera, Customer, Dates, Amount, Status
- Badge indicators (green for active, red for overdue)

---

## 3. 📷 Camera Inventory Page

**What you'll see:**

### Top Bar:
- "Cameras" heading
- "Manage your camera equipment" subtitle

### Filter Section (White Card):
- Search box (left): "Search cameras..."
- Status dropdown: All Status / Available / Rented / Maintenance
- Category dropdown: All Categories / DSLR / Mirrorless / etc.
- "+ Add Camera" button (right, purple)

### Camera List Table:
Columns:
- **Name**: Camera name in bold
- **Brand/Model**: e.g., "Canon EOS R5"
- **Category**: Badge with category
- **Serial #**: Serial number or "N/A"
- **Daily Rate**: Dollar amount
- **Status**: Color badge (green/yellow/gray)
- **Condition**: Text (excellent/good/fair/poor)
- **Actions**: Edit and Delete buttons

### Add/Edit Camera Modal:
When clicking "+ Add Camera" or "Edit":
- Modal overlay (dark background)
- White popup form with:
  - Camera Name field
  - Brand and Model fields (side-by-side)
  - Category dropdown
  - Serial Number field
  - Purchase Date field
  - Purchase Price field
  - Daily Rental Rate field
  - Condition dropdown
  - Description textarea
  - Cancel and Create/Update buttons

---

## 4. 👥 Customers Page

**What you'll see:**

### Top Bar:
- "Customers" heading
- "Manage your customer database" subtitle

### Search & Action Bar (White Card):
- Search box: "Search customers..."
- "+ Add Customer" button (right, purple)

### Customer List Table:
Columns:
- **Name**: Bold customer name
- **Email**: Email or "N/A"
- **Phone**: Phone number
- **Address**: Address or "N/A"
- **ID Number**: ID or "N/A"
- **Actions**: Edit and Delete buttons

### Add/Edit Customer Modal:
- Full Name field (required)
- Email and Phone fields (side-by-side)
- Address field
- ID Number field
- Notes textarea
- Cancel and Create/Update buttons

---

## 5. 📋 Rentals Page

**What you'll see:**

### Top Bar:
- "Rentals" heading
- "Manage camera rentals" subtitle

### Filter & Action Bar (White Card):
- Status dropdown: All / Active / Completed / Cancelled
- "+ New Rental" button (right, purple)

### Rentals Table:
Columns:
- **ID**: #1, #2, etc.
- **Camera**: Name (bold) + Brand/Model
- **Customer**: Name + Phone
- **Start Date**: Date
- **End Date**: Date
- **Days**: Number of rental days
- **Amount**: Total dollar amount
- **Deposit**: Deposit amount
- **Status**: Badge (yellow for active, green for completed, red for overdue)
- **Actions**: Return, Edit, Delete buttons

**Overdue Highlight:**
- Entire row has yellow background if overdue

### New Rental Modal:
- Camera dropdown (shows available cameras with rates)
- Customer dropdown (shows customers with phone)
- Start Date field
- End Date field
- Daily Rate field
- Deposit field
- Notes textarea
- Cancel and Create Rental buttons

**Edit Rental Modal:**
- Same fields
- Additional Status dropdown
- Can modify dates, rate, status

---

## 6. 🎨 Visual Design Elements

### Colors:
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#28a745)
- **Warning**: Yellow (#ffc107)
- **Danger**: Red (#dc3545)
- **Background**: Light gray (#f5f5f5)
- **Cards**: White with subtle shadows

### Badges:
- **Available/Success**: Green background, dark green text
- **Rented/Warning**: Yellow background, dark yellow text
- **Overdue/Danger**: Red background, dark red text
- **Completed/Info**: Blue background, dark blue text
- **Cancelled/Secondary**: Gray background, dark gray text

### Buttons:
- **Primary**: Purple gradient with shadow on hover
- **Secondary**: Gray solid
- **Success**: Green solid
- **Danger**: Red solid
- **Small**: Compact size for actions

### Layout:
- **Sidebar**: Fixed left, purple gradient, 250px wide
- **Main Content**: Right side, 30px padding, white cards
- **Cards**: Rounded corners (10px), shadow, white background
- **Forms**: Clean inputs, proper spacing, labels

---

## 7. 🔔 Interactive Elements

### Status Indicators:
- **Green Badge**: Available, Active (good)
- **Yellow Badge**: Rented (in use)
- **Red Badge**: Overdue (needs attention)
- **Gray Badge**: Maintenance, Cancelled

### Visual Feedback:
- Hover effects on buttons
- Row highlighting on table hover
- Modal overlays for forms
- Loading states ("Loading...")
- Empty states ("No cameras found")
- Error alerts (red background)
- Success messages (green background)

### Navigation:
- Sidebar icons + labels
- Active page highlighted
- Smooth transitions
- Logout button at bottom

---

## 8. 📱 Responsive Behavior

### Desktop (> 768px):
- Full sidebar visible
- Multi-column grid
- Side-by-side form fields
- Large stat cards

### Mobile/Tablet (< 768px):
- Condensed sidebar (icons only)
- Single column layout
- Stacked form fields
- Smaller fonts

---

## 9. 🎭 User Interactions

### Common Workflows:

**Workflow 1: Rent Out Equipment**
1. Dashboard → See available cameras
2. Rentals → "+ New Rental"
3. Select customer from dropdown
4. Select camera from dropdown
5. Set dates (auto-calculates amount)
6. Add deposit if needed
7. Click "Create Rental"
8. Camera status auto-updates to "rented"

**Workflow 2: Return Equipment**
1. Rentals → Find active rental
2. Click "Return" button
3. Confirm return
4. Status changes to "completed"
5. Camera becomes available again

**Workflow 3: Add New Camera**
1. Cameras → "+ Add Camera"
2. Fill in details
3. Set daily rate
4. Click "Create"
5. Camera appears in list

**Workflow 4: Check Business Status**
1. Dashboard → View all statistics
2. See revenue trends
3. Check overdue rentals (highlighted)
4. Review active rentals

---

## 10. 🔍 What To Look For

### Dashboard:
- Total revenue increasing
- Active rentals tracked
- Overdue rentals flagged (red)
- Monthly trends visible

### Cameras:
- All equipment listed
- Status badges clear
- Easy to search/filter
- Quick edit access

### Rentals:
- Clear status indicators
- Overdue rows highlighted
- Dates clearly visible
- Quick return action

### Customers:
- Complete contact info
- Easy to search
- Clean layout

---

## 11. 🎯 Key Visual Features

### Professional Look:
✅ Clean, modern design  
✅ Consistent color scheme  
✅ Proper spacing and alignment  
✅ Readable fonts and sizes  
✅ Intuitive icons  

### User-Friendly:
✅ Clear labels and headings  
✅ Helpful placeholders  
✅ Confirmation dialogs  
✅ Error messages  
✅ Loading indicators  

### Business-Focused:
✅ Financial data prominent  
✅ Status always visible  
✅ Quick actions available  
✅ Important info highlighted  

---

## 12. 💡 Visual Tips

### Look for these indicators:
- **Purple gradient** = Primary actions (Add, Create)
- **Green badge** = Good status (Available, Active)
- **Yellow** = Caution (Rented, or overdue highlight)
- **Red** = Attention needed (Overdue, Delete)
- **Bold text** = Important info (names, amounts)
- **Small gray text** = Additional details

### Empty States:
When no data exists, you'll see:
- Large emoji or icon
- "No [items] found" message
- Helpful suggestion to add first item

---

## 🖥️ Screen-by-Screen Summary

1. **Login**: Clean purple gradient, centered form
2. **Dashboard**: 8 stat cards + trends + active rentals
3. **Cameras**: Searchable table + filters + modal forms
4. **Rentals**: Status-coded table + quick actions
5. **Customers**: Contact list + search + history

**Sidebar** (Always visible):
- Logo + username
- 4 navigation items
- Logout button

---

**The interface is designed to be intuitive - if you can use a website, you can use LensyCam!** 🎉

No training needed. Everything is where you'd expect it to be. Clear buttons, obvious actions, and helpful feedback at every step.
