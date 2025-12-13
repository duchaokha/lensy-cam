const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Use database directory for easier backup
const DB_DIR = process.env.DATABASE_DIR || path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'rental.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Cameras table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS cameras (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          model TEXT NOT NULL,
          category TEXT NOT NULL,
          serial_number TEXT UNIQUE,
          purchase_date DATE,
          purchase_price DECIMAL(10,2),
          daily_rate DECIMAL(10,2) NOT NULL,
          hourly_rate DECIMAL(10,2),
          status TEXT DEFAULT 'available',
          condition TEXT DEFAULT 'excellent',
          description TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Customers table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          address TEXT,
          id_number TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Rentals table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rentals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          camera_id INTEGER NOT NULL,
          customer_id INTEGER NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          start_time TIME,
          end_time TIME,
          actual_return_date DATE,
          actual_return_time TIME,
          daily_rate DECIMAL(10,2) NOT NULL,
          hourly_rate DECIMAL(10,2),
          total_amount DECIMAL(10,2) NOT NULL,
          deposit DECIMAL(10,2) DEFAULT 0,
          status TEXT DEFAULT 'active',
          rental_type TEXT DEFAULT 'daily',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (camera_id) REFERENCES cameras(id),
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
      `);

      // Create default admin user
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      this.db.run(
        'INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)',
        ['admin', defaultPassword, 'admin@lensycam.local'],
        (err) => {
          if (err) {
            console.error('Error creating default user:', err);
          } else {
            console.log('Database initialized successfully');
          }
        }
      );
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();
