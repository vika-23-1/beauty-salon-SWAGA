const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { validateAppointmentData, isTimeSlotTaken } = require('../validators/appointments');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

module.exports = (db) => {
  router.get('/', apiLimiter, requireAuth(db), (req, res) => {
    const { role, id } = req.user;
    let appointments;
    if (role === 'admin') {
      appointments = db.prepare(`
        SELECT a.*, 
          c.name as client_name, c.phone as client_phone,
          m.name as master_name,
          s.name as service_name, s.duration, s.price
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN users m ON a.master_id = m.id
        JOIN services s ON a.service_id = s.id
        WHERE a.status = 'active'
        ORDER BY a.date, a.time
      `).all();
    } else if (role === 'master') {
      appointments = db.prepare(`
        SELECT a.*,
          c.name as client_name, c.phone as client_phone,
          s.name as service_name, s.duration, s.price
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN services s ON a.service_id = s.id
        WHERE a.master_id = ? AND a.status = 'active'
        ORDER BY a.date, a.time
      `).all(id);
    } else {
      appointments = db.prepare(`
        SELECT a.*,
          m.name as master_name,
          s.name as service_name, s.duration, s.price
        FROM appointments a
        JOIN users m ON a.master_id = m.id
        JOIN services s ON a.service_id = s.id
        WHERE a.client_id = ? AND a.status = 'active'
        ORDER BY a.date, a.time
      `).all(id);
    }
    res.json(appointments);
  });

  router.post('/', apiLimiter, requireAuth(db), (req, res) => {
    const data = { ...req.body };
    if (req.user.role === 'client') {
      data.client_id = req.user.id;
    }
    const validation = validateAppointmentData(data);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const { client_id, master_id, service_id, date, time } = data;
    if (isTimeSlotTaken(db, master_id, date, time)) {
      return res.status(400).json({ error: 'Это время уже занято у данного мастера' });
    }
    const result = db.prepare(
      "INSERT INTO appointments (client_id, master_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, 'active')"
    ).run(client_id, master_id, service_id, date, time);
    res.status(201).json({ id: result.lastInsertRowid, client_id, master_id, service_id, date, time, status: 'active' });
  });

  router.delete('/:id', apiLimiter, requireAuth(db), (req, res) => {
    const { role, id } = req.user;
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    if (role !== 'admin' && appointment.client_id !== id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
