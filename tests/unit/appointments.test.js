const { validateAppointmentData, isFutureDate } = require('../../server/validators/appointments');

describe('validateAppointmentData', () => {
  test('validates correct appointment data', () => {
    const data = {
      client_id: 1,
      master_id: 2,
      service_id: 1,
      date: '2026-12-01',
      time: '14:00'
    };
    const result = validateAppointmentData(data);
    expect(result.valid).toBe(true);
  });

  test('rejects missing fields', () => {
    const data = { client_id: 1, master_id: 2 };
    const result = validateAppointmentData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Все поля обязательны');
  });

  test('rejects invalid date format', () => {
    const data = {
      client_id: 1, master_id: 2, service_id: 1,
      date: '01-12-2026', time: '14:00'
    };
    const result = validateAppointmentData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Неверный формат даты');
  });

  test('rejects invalid time format', () => {
    const data = {
      client_id: 1, master_id: 2, service_id: 1,
      date: '2026-12-01', time: '2pm'
    };
    const result = validateAppointmentData(data);
    expect(result.valid).toBe(false);
  });
});

describe('isFutureDate', () => {
  test('returns true for a future date', () => {
    expect(isFutureDate('2099-01-01', '12:00')).toBe(true);
  });

  test('returns false for a past date', () => {
    expect(isFutureDate('2000-01-01', '12:00')).toBe(false);
  });
});
