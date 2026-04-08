const express = require('express');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const mastersRoutes = require('./routes/masters');
const appointmentsRoutes = require('./routes/appointments');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const authRouter = authRoutes(db);
app.use('/', authRouter);
app.use('/services', servicesRoutes(db));
app.use('/masters', mastersRoutes(db));
app.use('/appointments', appointmentsRoutes(db));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
