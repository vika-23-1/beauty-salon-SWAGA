const { isTimeSlotTaken } = require('../../server/validators/appointments');
const Database = require('better-sqlite3');

describe('isTimeSlotTaken', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        master_id INTEGER,
        service_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'active'
      );
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('returns false when time slot is free', () => {
    const taken = isTimeSlotTaken(db, 1, '2026-12-01', '14:00');
    expect(taken).toBe(false);
  });

  test('returns true when time slot is already booked', () => {
    db.prepare("INSERT INTO appointments (client_id, master_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, 'active')")
      .run(1, 1, 1, '2026-12-01', '14:00');
    const taken = isTimeSlotTaken(db, 1, '2026-12-01', '14:00');
    expect(taken).toBe(true);
  });

  test('allows different masters at the same time', () => {
    db.prepare("INSERT INTO appointments (client_id, master_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, 'active')")
      .run(1, 1, 1, '2026-12-01', '14:00');
    const taken = isTimeSlotTaken(db, 2, '2026-12-01', '14:00');
    expect(taken).toBe(false);
  });

  test('allows same master at different times', () => {
    db.prepare("INSERT INTO appointments (client_id, master_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, 'active')")
      .run(1, 1, 1, '2026-12-01', '14:00');
    const taken = isTimeSlotTaken(db, 1, '2026-12-01', '15:00');
    expect(taken).toBe(false);
  });

  test('ignores cancelled appointments', () => {
    db.prepare("INSERT INTO appointments (client_id, master_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, 'cancelled')")
      .run(1, 1, 1, '2026-12-01', '14:00');
    const taken = isTimeSlotTaken(db, 1, '2026-12-01', '14:00');
    expect(taken).toBe(false);
  });
});
