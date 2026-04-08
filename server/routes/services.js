const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

module.exports = (db) => {
  router.get('/', requireAuth(db), (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  router.post('/', requireAuth(db), (req, res) => {
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

  router.delete('/:id', requireAuth(db), (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
