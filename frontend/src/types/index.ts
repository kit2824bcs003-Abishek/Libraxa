export type UserRole = 'student' | 'librarian' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  student_id: string | null;
  department: string | null;
  role: UserRole;
  created_at: string;
}

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
  category_slug?: string;
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
  book_title: string;
  book_author: string;
  book_cover: string;
  book_isbn?: string;
  category_name?: string;
  is_overdue?: boolean;
  days_remaining?: number;
  overdue_days?: number;
  student_name?: string;
  student_email?: string;
  student_id?: string;
  department?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  reserved_at: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  book_title: string;
  book_author: string;
  book_cover: string;
  available_copies?: number;
  queue_position?: number;
  book_isbn?: string;
  category_name?: string;
}

export interface Fine {
  id: number;
  user_id: number;
  borrowing_id: number | null;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at: string | null;
  book_title?: string;
  borrowed_at?: string;
  due_at?: string;
  returned_at?: string;
  overdue_days?: number;
}

export interface FinesSummary {
  outstanding: number;
  paid: number;
  total: number;
  fines: Fine[];
}

export interface NotificationItem {
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

export interface DashboardData {
  header: {
    greeting: string;
    subtitle: string;
    current_semester: string;
    library_status: string;
  };
  stats: {
    books_borrowed: { value: number; subtext: string };
    currently_reading: { value: number; subtext: string };
    due_this_week: { value: number; subtext: string };
    outstanding_fine: { value: string; subtext: string };
  };
  currently_reading: Array<{
    id: number;
    book_id: number;
    title: string;
    author: string;
    cover_url: string;
    borrow_date: string;
    due_date: string;
    progress: number;
    total_pages: number;
  }>;
  upcoming_returns: Array<{
    id: number;
    title: string;
    author: string;
    cover_url: string;
    due_at: string;
    days_remaining: number;
    is_overdue: boolean;
    status_text: string;
  }>;
  recent_activity: Array<{
    id: number;
    type: string;
    action: string;
    item: string;
    timestamp: string;
    date: string;
    badge: string;
  }>;
  monthly_borrowing: Array<{
    month: string;
    count: number;
  }>;
  insights: {
    most_borrowed_category: string;
    most_popular_book: string;
    books_available: number;
    active_borrowers: number;
  };
}

export interface AdminStats {
  total_books: number;
  total_titles: number;
  available_books: number;
  borrowed_books: number;
  overdue_books: number;
  registered_students: number;
  total_fines: number;
}
