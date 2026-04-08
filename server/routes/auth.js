const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createSession } = require('../middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

module.exports = (db) => {
  router.post('/register', authLimiter, (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Имя, телефон и пароль обязательны' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
    }
    const result = db.prepare("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, 'client')").run(name, phone, password);
    const user = db.prepare('SELECT id, name, phone, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = createSession(user.id);
    res.status(201).json({ user, token });
  });

  router.post('/login', authLimiter, (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Телефон и пароль обязательны' });
    }
    const user = db.prepare('SELECT * FROM users WHERE phone = ? AND password = ?').get(phone, password);
    if (!user) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }
    const token = createSession(user.id);
    const userWithoutPassword = { id: user.id, name: user.name, phone: user.phone, role: user.role };
    res.json({ user: userWithoutPassword, token });
  });

  return router;
};
