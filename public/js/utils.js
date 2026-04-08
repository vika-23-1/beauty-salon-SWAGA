const Utils = {
  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.style.display = 'block'; }
  },
  hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) { el.style.display = 'none'; }
  },
  formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  },
  formatTime(timeStr) {
    return timeStr.substring(0, 5);
  },
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }
};
