const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

module.exports = (db) => {
  router.get('/', apiLimiter, requireAuth(db), (req, res) => {
    const masters = db.prepare("SELECT id, name, phone FROM users WHERE role = 'master'").all();
    res.json(masters);
  });

  router.post('/', apiLimiter, requireAuth(db), (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Имя, телефон и пароль обязательны' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
    }
    const result = db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, 'master')").run(name, phone, password);
    res.status(201).json({ id: result.lastInsertRowid, name, phone, role: 'master' });
  });

  router.delete('/:id', apiLimiter, requireAuth(db), (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    db.prepare("DELETE FROM users WHERE id = ? AND role = 'master'").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
