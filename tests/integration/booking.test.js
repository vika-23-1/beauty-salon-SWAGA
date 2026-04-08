const request = require('supertest');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

function createTestApp() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client'
    );
    CREATE TABLE services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL
    );
    CREATE TABLE appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      master_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);
  db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)").run('Мастер Тест', '+79000000001', bcrypt.hashSync('pass', 10), 'master');
  db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run('Стрижка', 60, 1500);

  const express = require('express');
  const app = express();
  app.use(express.json());

  const authRoutes = require('../../server/routes/auth');
  const servicesRoutes = require('../../server/routes/services');
  const mastersRoutes = require('../../server/routes/masters');
  const appointmentsRoutes = require('../../server/routes/appointments');

  const authRouter = authRoutes(db);
  app.use('/', authRouter);
  app.use('/services', servicesRoutes(db));
  app.use('/masters', mastersRoutes(db));
  app.use('/appointments', appointmentsRoutes(db));

  return { app, db };
}

describe('Full booking flow integration test', () => {
  let app, db, token, masterId, serviceId;

  beforeAll(() => {
    ({ app, db } = createTestApp());
    masterId = db.prepare("SELECT id FROM users WHERE role = 'master'").get().id;
    serviceId = db.prepare("SELECT id FROM services").get().id;
  });

  test('Step 1: Client registers', async () => {
    const res = await request(app)
      .post('/register')
      .send({ name: 'Иван Иванов', phone: '+79001234567', password: 'secret' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('client');
    token = res.body.token;
    expect(token).toBeTruthy();
  });

  test('Step 2: Client views services', async () => {
    const res = await request(app)
      .get('/services')
      .set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Step 3: Client views masters', async () => {
    const res = await request(app)
      .get('/masters')
      .set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Step 4: Client books appointment', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('x-auth-token', token)
      .send({ master_id: masterId, service_id: serviceId, date: '2026-12-01', time: '14:00' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
  });

  test('Step 5: Double booking is rejected', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('x-auth-token', token)
      .send({ master_id: masterId, service_id: serviceId, date: '2026-12-01', time: '14:00' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('занято');
  });

  test('Step 6: Client views their appointments', async () => {
    const res = await request(app)
      .get('/appointments')
      .set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
