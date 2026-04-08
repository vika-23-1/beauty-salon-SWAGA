const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

module.exports = (db) => {
  router.get('/', apiLimiter, requireAuth(db), (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  router.post('/', apiLimiter, requireAuth(db), (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const { name, duration, price } = req.body;
    if (!name || !duration || !price) {
      return res.status(400).json({ error: 'Название, длительность и цена обязательны' });
    }
    const result = db.prepare('INSERT INTO services (name, duration, price) VALUES (?, ?, ?)').run(name, duration, price);
    res.status(201).json({ id: result.lastInsertRowid, name, duration, price });
  });

  router.delete('/:id', apiLimiter, requireAuth(db), (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const active = db.prepare("SELECT id FROM appointments WHERE service_id = ? AND status = 'active'").get(req.params.id);
    if (active) {
      return res.status(400).json({ error: 'Нельзя удалить услугу с активными записями' });
    }
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
