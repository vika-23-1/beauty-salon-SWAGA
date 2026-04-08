const { validateAppointmentData } = require('../../server/validators/appointments');

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
