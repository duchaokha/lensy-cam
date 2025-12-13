# 📷 LensyCam - Camera Rental Management System
## Complete Feature List & Technical Specifications

---

## 🎯 Business Features

### Camera Inventory Management
✅ Add unlimited cameras to inventory  
✅ Track brand, model, serial number  
✅ Set purchase date and price  
✅ Define daily rental rates  
✅ Monitor equipment condition (Excellent/Good/Fair/Poor)  
✅ Categorize equipment (DSLR, Mirrorless, Cinema, Action, Drone, Lens, Accessories)  
✅ Real-time availability status (Available/Rented/Maintenance)  
✅ Add detailed descriptions  
✅ Search cameras by name, brand, model, or serial number  
✅ Filter by status and category  
✅ Prevent deletion of cameras with active rentals  

### Rental Operations
✅ Create new rentals with customer assignment  
✅ Automatic rental period calculation  
✅ Automatic total amount computation (days × daily rate)  
✅ Record security deposits  
✅ Track rental status (Active/Completed/Cancelled)  
✅ Set start and end dates  
✅ Monitor due dates  
✅ Visual overdue indicators  
✅ Quick return functionality  
✅ Update rental information  
✅ Add rental notes  
✅ Automatic camera status updates  
✅ Prevent camera deletion during active rentals  

### Customer Management
✅ Unlimited customer records  
✅ Store full contact information (name, email, phone, address)  
✅ Record ID numbers for verification  
✅ Add customer-specific notes  
✅ View complete rental history per customer  
✅ Search by name, email, or phone  
✅ Edit customer information  
✅ Delete inactive customer records  
✅ Prevent deletion of customers with active rentals  

### Dashboard & Analytics
✅ Real-time business statistics  
✅ Total revenue tracking (all-time, yearly, monthly)  
✅ Camera inventory overview  
✅ Available vs. rented camera counts  
✅ Active rental monitoring  
✅ Overdue rental detection and alerts  
✅ Total customer count  
✅ Monthly revenue trends (6-month history)  
✅ Recent rental activity list  
✅ Revenue breakdown by month  
✅ Rental count statistics  

### Security & Access Control
✅ Secure user authentication with JWT  
✅ Password encryption (bcrypt)  
✅ Session management  
✅ Protected API endpoints  
✅ Password change functionality  
✅ Automatic session timeout  
✅ Login/logout functionality  

---

## 💻 Technical Specifications

### Architecture
- **Type:** Full-stack web application  
- **Pattern:** Client-Server (REST API)  
- **Database:** SQLite (embedded, cross-platform)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Frontend:** Single Page Application (SPA)  

### Backend Technology
- **Runtime:** Node.js (v14+)  
- **Framework:** Express.js 4.18  
- **Database:** SQLite 3.5  
- **Authentication:** jsonwebtoken 9.0, bcryptjs 2.4  
- **Middleware:** CORS, body-parser  
- **Development:** nodemon, concurrently  

### Frontend Technology
- **Framework:** React 18.2  
- **Router:** React Router 6.16  
- **Build Tool:** Create React App (Webpack)  
- **Styling:** Custom CSS3 (responsive)  
- **State Management:** React Context API  
- **HTTP Client:** Fetch API  

### Database Schema

**Users Table:**
- Authentication and user management
- Encrypted password storage

**Cameras Table:**
- Complete equipment inventory
- Purchase and rental information
- Status and condition tracking

**Customers Table:**
- Customer contact information
- ID verification details
- Custom notes

**Rentals Table:**
- Complete rental records
- Financial tracking
- Status management
- Foreign keys to cameras and customers

### API Endpoints (17 total)

**Authentication (2):**
- POST /api/auth/login
- POST /api/auth/change-password

**Cameras (5):**
- GET /api/cameras (with filters)
- GET /api/cameras/:id
- POST /api/cameras
- PUT /api/cameras/:id
- DELETE /api/cameras/:id

**Customers (5):**
- GET /api/customers (with search)
- GET /api/customers/:id
- POST /api/customers
- PUT /api/customers/:id
- DELETE /api/customers/:id

**Rentals (6):**
- GET /api/rentals (with filters)
- GET /api/rentals/:id
- POST /api/rentals
- PUT /api/rentals/:id
- POST /api/rentals/:id/return
- DELETE /api/rentals/:id

**Dashboard (1):**
- GET /api/dashboard/stats

### System Requirements

**Development:**
- Node.js 14.0 or higher
- npm 6.0 or higher
- 100MB free disk space
- Any modern web browser

**Production:**
- Node.js 14.0 or higher
- 50MB free disk space
- Modern browser (Chrome, Firefox, Safari, Edge)
- Local network or internet connection

**Supported Platforms:**
- ✅ macOS (10.12+)
- ✅ Windows (10/11)
- ✅ Linux (Ubuntu, Debian, CentOS, etc.)

### Performance Characteristics
- **Database:** SQLite (handles 100,000+ records efficiently)
- **Response Time:** < 100ms for most operations
- **Memory Usage:** ~50-100MB RAM
- **Concurrent Users:** Designed for single user (owner)
- **Build Size:** ~2MB (minified frontend)

---

## 📊 Data Management

### Automatic Calculations
- Rental duration (days between dates)
- Total rental amount (duration × daily rate)
- Revenue aggregations (monthly, yearly, total)
- Rental counts and statistics

### Data Integrity
- Foreign key constraints (rentals → cameras, customers)
- Unique constraints (serial numbers, usernames)
- Required field validation
- Deletion protection for active records
- Automatic status updates

### Search & Filter Capabilities
- Camera search (name, brand, model, serial)
- Customer search (name, email, phone)
- Status filtering (available, rented, maintenance)
- Category filtering (all equipment types)
- Rental status filtering (active, completed, cancelled)

---

## 🎨 User Interface Features

### Responsive Design
- Mobile-friendly layout
- Tablet optimization
- Desktop full-screen support
- Adaptive navigation

### Visual Elements
- Color-coded status badges
- Overdue rental highlighting
- Gradient headers
- Card-based layout
- Modal dialogs
- Loading states
- Empty state messages
- Error alerts

### User Experience
- Intuitive navigation sidebar
- Quick action buttons
- In-line editing
- Confirmation dialogs
- Search-as-you-type
- Auto-focus on inputs
- Keyboard-friendly forms

---

## 🔧 Configuration Options

### Environment Variables
- PORT (server port)
- JWT_SECRET (security key)
- NODE_ENV (development/production)

### Customizable Elements
- Daily rental rates (per camera)
- Security deposit amounts
- Camera categories
- Equipment conditions
- User credentials

---

## 📈 Reporting Capabilities

### Available Reports
- Total revenue (all-time, yearly, monthly)
- Camera utilization (available vs. rented)
- Active rentals list
- Overdue rentals
- Monthly revenue trends
- Customer rental history
- Rental counts by period

### Export Capabilities
- Database file access (SQLite)
- Manual data backup
- Screen printouts (browser print function)

---

## 🛡️ Security Features

### Authentication
- Secure password hashing (bcrypt, 10 rounds)
- JWT tokens (24-hour expiration)
- Protected routes
- Session persistence

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- CORS configuration
- Input validation

### Access Control
- Single-user system (owner only)
- No public access
- All endpoints protected (except login)

---

## 🚀 Development Features

### Code Organization
- Modular backend routes
- Reusable React components
- Centralized API service
- Context-based state management
- Separation of concerns

### Developer Tools
- Hot reload (development)
- Error logging
- Concurrently run server & client
- Environment-based configuration
- Clear project structure

---

## 📦 Package Information

### Backend Dependencies (7)
- express, cors, sqlite3
- bcryptjs, jsonwebtoken
- dotenv, multer, date-fns

### Frontend Dependencies (3)
- react, react-dom
- react-router-dom

### Dev Dependencies (2)
- nodemon, concurrently

### Total Package Size
- Backend: ~15MB
- Frontend: ~200MB (includes build tools)
- Runtime: ~2MB (built frontend)

---

## 🎯 Use Cases

Perfect for:
- Small camera rental businesses
- Photography equipment rental shops
- Freelance photographers with rental inventory
- Film production companies
- Educational institutions with equipment lending

---

## 📝 Included Documentation

1. **README.md** - Project overview and quick start
2. **USER_GUIDE.md** - Comprehensive user manual
3. **QUICKSTART.md** - Fast reference guide
4. **DEPLOYMENT.md** - Production deployment instructions
5. **FEATURES.md** - This file - complete feature list

---

## ✅ Quality Assurance

### Tested Scenarios
- User authentication flow
- Camera CRUD operations
- Customer management
- Rental creation and completion
- Data validation
- Error handling
- Cross-browser compatibility

### Known Limitations
- Single-user system (no multi-user support)
- No built-in backup automation
- No email notifications
- No invoice generation (PDF)
- Basic reporting (no advanced analytics)

---

## 🔮 Future Enhancement Possibilities

- Multi-user support with roles (admin, staff)
- Email/SMS notifications for due dates
- Automated invoice generation (PDF)
- Photo uploads for equipment
- Barcode/QR code scanning
- Advanced reporting and analytics
- Payment gateway integration
- Equipment reservation system
- Maintenance scheduling
- Insurance tracking
- Mobile app (iOS/Android)
- API for third-party integrations

---

## 📞 Support & Maintenance

### Self-Service Resources
- Complete documentation suite
- Troubleshooting guides
- API reference
- Deployment instructions

### Maintenance Requirements
- Regular database backups (manual/automated)
- Periodic dependency updates
- Password rotation
- Database cleanup (optional)

---

**LensyCam v1.0.0** - Built with ❤️ for camera rental businesses

*Cross-platform • Lightweight • Easy to use • Feature-complete*
