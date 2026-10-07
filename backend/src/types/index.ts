export type UserRole = 'student' | 'librarian' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  student_id: string | null;
  department: string | null;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  book_count?: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category_id: number;
  category_name?: string;
  publisher: string;
  publication_year: number;
  pages: number;
  language: string;
  description: string;
  total_copies: number;
  available_copies: number;
  rating: number;
  cover_url: string;
  created_at: string;
}

export type BorrowingStatus = 'borrowed' | 'returned' | 'overdue';

export interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  status: BorrowingStatus;
  fine_amount: number;
  book_title?: string;
  book_author?: string;
  book_cover?: string;
  user_name?: string;
  user_email?: string;
}

export type ReservationStatus = 'active' | 'fulfilled' | 'cancelled';

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  reserved_at: string;
  status: ReservationStatus;
  book_title?: string;
  book_author?: string;
  book_cover?: string;
  available_copies?: number;
  queue_position?: number;
}

export type FineStatus = 'pending' | 'paid';

export interface Fine {
  id: number;
  user_id: number;
  borrowing_id: number;
  amount: number;
  status: FineStatus;
  created_at: string;
  paid_at: string | null;
  book_title?: string;
  borrowed_at?: string;
  due_at?: string;
  returned_at?: string;
  overdue_days?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface LibraryEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category?: string;
}

export interface AuthTokenPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
