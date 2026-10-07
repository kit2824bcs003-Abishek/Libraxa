import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Bookmark, Filter, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const BookCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [borrowModalBook, setBorrowModalBook] = useState<Book | null>(null);
  const [reserveModalBook, setReserveModalBook] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchBooks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getBooks({
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: selectedSort,
      });
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch categories & books
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch books when search/category/sort changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSort]);

  // Handle Search input change and URL query update
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const handleConfirmBorrow = async () => {
    if (!borrowModalBook) return;
    setActionLoading(true);
    try {
      await api.borrowBook(borrowModalBook.id);
      showToast(`"${borrowModalBook.title}" borrowed successfully. Due in 14 days.`, 'success');
      setBorrowModalBook(null);
      // Refresh catalog data
      fetchBooks();
    } catch (err: any) {
      showToast(err.message || 'Failed to borrow book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReserve = async () => {
    if (!reserveModalBook) return;
    setActionLoading(true);
    try {
      await api.createReservation(reserveModalBook.id);
      showToast(`Reservation placed for "${reserveModalBook.title}".`, 'success');
      setReserveModalBook(null);
      fetchBooks();
    } catch (err: any) {
      showToast(err.message || 'Failed to reserve book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filterChips = [
    { slug: 'all', name: 'All' },
    { slug: 'programming', name: 'Programming' },
    { slug: 'ai-ml', name: 'AI & ML' },
    { slug: 'networking', name: 'Networking' },
    { slug: 'database', name: 'Database' },
    { slug: 'mathematics', name: 'Mathematics' },
    { slug: 'science', name: 'Science' },
    { slug: 'management', name: 'Management' },
    { slug: 'literature', name: 'Literature' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Library Catalog</h1>
        <p className="page-subtitle">
          Explore thousands of resources available through LIBRIXA.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title, author, ISBN, or category..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Sort:
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="form-select"
              style={{ width: 170, height: 42, padding: '0 12px' }}
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {filterChips.map((chip) => {
            const isSelected = selectedCategory === chip.slug;
            return (
              <button
                key={chip.slug}
                onClick={() => setSelectedCategory(chip.slug)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--navy)',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Results Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading library catalog..." />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <AlertCircle size={32} color="var(--danger)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>
          <Button variant="primary" onClick={fetchBooks}>
            Try Again
          </Button>
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description={
            search
              ? `No catalog results match "${search}". Try adjusting your keywords or clearing filters.`
              : 'No books available in this category yet.'
          }
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('all');
            setSearchParams({});
          }}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing <strong>{books.length}</strong> resources
            </span>
          </div>

          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={(b) => setBorrowModalBook(b)}
                onReserve={(b) => setReserveModalBook(b)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      {borrowModalBook && (
        <Modal
          isOpen={!!borrowModalBook}
          onClose={() => setBorrowModalBook(null)}
          title="Borrow this book?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setBorrowModalBook(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmBorrow} isLoading={actionLoading}>
                Confirm Borrow
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <img
              src={borrowModalBook.cover_url}
              alt={borrowModalBook.title}
              style={{ width: 80, height: 115, objectFit: 'cover', borderRadius: 6 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                {borrowModalBook.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                By {borrowModalBook.author}
              </p>
              <div style={{ marginTop: 8, padding: 10, backgroundColor: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 600 }}>
                  Loan period: 14 days
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Due date will automatically be set 14 days from today. You can renew before the due date if eligible.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reserve Confirmation Modal */}
      {reserveModalBook && (
        <Modal
          isOpen={!!reserveModalBook}
          onClose={() => setReserveModalBook(null)}
          title="Place Book Reservation"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReserveModalBook(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReserve} isLoading={actionLoading}>
                Confirm Reservation
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <img
              src={reserveModalBook.cover_url}
              alt={reserveModalBook.title}
              style={{ width: 80, height: 115, objectFit: 'cover', borderRadius: 6 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                {reserveModalBook.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                By {reserveModalBook.author}
              </p>
              <div style={{ marginTop: 8, padding: 10, backgroundColor: 'var(--warning-bg)', borderRadius: 8, border: '1px solid var(--warning-border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--warning)', fontWeight: 600 }}>
                  Currently All Copies Checked Out
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  You will be added to the reservation queue. As soon as a student returns a copy, you will receive an instant notification to claim it.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
