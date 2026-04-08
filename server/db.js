const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client'
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    master_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (master_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  );
`);

const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (usersCount.count === 0) {
  db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)").run('Администратор', '+70000000000', 'admin123', 'admin');
  db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)").run('Мастер Алексей', '+71111111111', 'master123', 'master');
  db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)").run('Мастер Мария', '+72222222222', 'master456', 'master');
}

const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
if (servicesCount.count === 0) {
  db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run('Стрижка', 60, 1500);
  db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run('Окрашивание', 120, 3500);
  db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run('Маникюр', 90, 2000);
  db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run('Педикюр', 90, 2200);
}

module.exports = db;
