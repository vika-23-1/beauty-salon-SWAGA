function isWorkingHours(time) {
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;
  const totalMinutes = hours * 60 + minutes;
  const start = 10 * 60;
  const end = 20 * 60;
  return totalMinutes >= start && totalMinutes < end;
}

function isFutureDate(date, time) {
  const appointmentDate = new Date(`${date}T${time}:00`);
  return appointmentDate > new Date();
}

function validateAppointmentData(data) {
  const { client_id, master_id, service_id, date, time } = data;
  if (!client_id || !master_id || !service_id || !date || !time) {
    return { valid: false, error: 'Все поля обязательны' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: 'Неверный формат даты' };
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { valid: false, error: 'Неверный формат времени' };
  }
  if (!isWorkingHours(time)) {
    return { valid: false, error: 'Рабочее время: 10:00 - 20:00' };
  }
  return { valid: true };
}

function isTimeSlotTaken(db, master_id, date, time, excludeId = null) {
  let query = 'SELECT id FROM appointments WHERE master_id = ? AND date = ? AND time = ? AND status = ?';
  const params = [master_id, date, time, 'active'];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const existing = db.prepare(query).get(...params);
  return !!existing;
}

module.exports = { isWorkingHours, isFutureDate, validateAppointmentData, isTimeSlotTaken };
