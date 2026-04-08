const Auth = {
  save(user, token) {
    localStorage.setItem('salon_user', JSON.stringify(user));
    localStorage.setItem('salon_token', token);
  },
  get() {
    const user = localStorage.getItem('salon_user');
    return user ? JSON.parse(user) : null;
  },
  getToken() {
    return localStorage.getItem('salon_token');
  },
  logout() {
    localStorage.removeItem('salon_user');
    localStorage.removeItem('salon_token');
    window.location.href = '/login.html';
  },
  requireAuth(role = null) {
    const user = this.get();
    if (!user) {
      window.location.href = '/login.html';
      return null;
    }
    if (role && user.role !== role) {
      window.location.href = '/login.html';
      return null;
    }
    return user;
  }
};
