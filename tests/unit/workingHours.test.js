const { isWorkingHours } = require('../../server/validators/appointments');

describe('isWorkingHours', () => {
  test('allows 10:00', () => {
    expect(isWorkingHours('10:00')).toBe(true);
  });

  test('allows 14:30', () => {
    expect(isWorkingHours('14:30')).toBe(true);
  });

  test('allows 19:59', () => {
    expect(isWorkingHours('19:59')).toBe(true);
  });

  test('rejects 09:59 (before working hours)', () => {
    expect(isWorkingHours('09:59')).toBe(false);
  });

  test('rejects 20:00 (end of working hours)', () => {
    expect(isWorkingHours('20:00')).toBe(false);
  });

  test('rejects 21:00 (after working hours)', () => {
    expect(isWorkingHours('21:00')).toBe(false);
  });

  test('rejects 00:00', () => {
    expect(isWorkingHours('00:00')).toBe(false);
  });

  test('rejects invalid time', () => {
    expect(isWorkingHours('invalid')).toBe(false);
  });
});
