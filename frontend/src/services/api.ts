const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('librixa_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  }

  // Auth APIs
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Dashboard API
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Books APIs
  async getBooks(params: { search?: string; category?: string; sort?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.sort) query.append('sort', params.sort);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/books${queryString}`);
  }

  async getBook(id: string | number) {
    return this.request(`/books/${id}`);
  }

  async getCategories() {
    return this.request('/books/categories');
  }

  async createBook(bookData: any) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: number | string, bookData: any) {
    return this.request(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: number | string) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Borrowing APIs
  async getMyBorrowings() {
    return this.request('/borrowings/my');
  }

  async borrowBook(bookId: number | string) {
    return this.request('/borrowings', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId }),
    });
  }

  async returnBook(borrowingId: number | string) {
    return this.request(`/borrowings/${borrowingId}/return`, {
      method: 'PATCH',
    });
  }

  async renewBook(borrowingId: number | string) {
    return this.request(`/borrowings/${borrowingId}/renew`, {
      method: 'PATCH',
    });
  }

  // Reservation APIs
  async getMyReservations() {
    return this.request('/reservations/my');
  }

  async createReservation(bookId: number | string) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId }),
    });
  }

  async cancelReservation(reservationId: number | string) {
    return this.request(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // Fines APIs
  async getMyFines() {
    return this.request('/fines/my');
  }

  async payFine(fineId: number | string) {
    return this.request(`/fines/${fineId}/pay`, {
      method: 'POST',
    });
  }

  // Notification APIs
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: number | string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Profile APIs
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profileData: { name: string; department?: string; student_id?: string }) {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Calendar API
  async getCalendar() {
    return this.request('/calendar');
  }

  // Admin APIs
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminBooks() {
    return this.request('/admin/books');
  }

  async getAdminBorrowings() {
    return this.request('/admin/borrowings');
  }

  async adminMarkReturned(id: number | string) {
    return this.request(`/admin/borrowings/${id}/return`, {
      method: 'PATCH',
    });
  }

  async adminExtendDue(id: number | string, days: number = 14) {
    return this.request(`/admin/borrowings/${id}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ days }),
    });
  }
}

export const api = new ApiService();
export default api;
