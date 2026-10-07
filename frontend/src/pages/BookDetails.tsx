import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  BookOpen,
  Bookmark,
  Calendar,
  Building2,
  FileText,
  Globe,
  Hash,
  Copy,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { Book } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getBook(id);
      if (res.success && res.data) {
        setBook(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Book not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleConfirmBorrow = async () => {
    if (!book) return;
    setActionLoading(true);
    try {
      await api.borrowBook(book.id);
      showToast(`"${book.title}" borrowed successfully. Due date set for 14 days.`, 'success');
      setBorrowModalOpen(false);
      fetchBookDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to borrow book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReserve = async () => {
    if (!book) return;
    setActionLoading(true);
    try {
      await api.createReservation(book.id);
      showToast(`Reservation confirmed for "${book.title}".`, 'success');
      setReserveModalOpen(false);
      fetchBookDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to reserve book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading book details..." />;
  }

  if (error || !book) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <AlertCircle size={36} color="var(--danger)" style={{ marginBottom: 12 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
          {error || 'Book Not Found'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          The requested resource could not be found in the catalog.
        </p>
        <Link to="/books">
          <Button variant="primary" icon={<ArrowLeft size={16} />}>
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/books')}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Main Details Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36, alignItems: 'start' }}>
        {/* LEFT COLUMN: Large Cover & Primary Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            className="card"
            style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)',
            }}
          >
            <img
              src={book.cover_url}
              alt={book.title}
              style={{
                width: '100%',
                height: 440,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Action Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Availability Status
              </span>
              {isAvailable ? (
                <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                  {book.available_copies} of {book.total_copies} Copies
                </Badge>
              ) : (
                <Badge variant="warning" icon={<Bookmark size={12} />}>
                  0 Copies Available
                </Badge>
              )}
            </div>

            {isAvailable ? (
              <Button
                variant="primary"
                size="lg"
                icon={<BookOpen size={18} />}
                onClick={() => setBorrowModalOpen(true)}
                style={{ width: '100%' }}
              >
                Borrow Book
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                icon={<Bookmark size={18} />}
                onClick={() => setReserveModalOpen(true)}
                style={{ width: '100%' }}
              >
                Reserve Book
              </Button>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Standard Loan: 14 Days • Auto-Renewal Eligible
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-light)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {book.category_name || 'Academic'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <span>{book.rating ? book.rating.toFixed(1) : '4.8'} Rating</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.25, marginBottom: 8 }}>
              {book.title}
            </h1>

            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Written by <strong>{book.author}</strong>
            </p>
          </div>

          {/* Book Overview */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              Book Overview
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.7 }}>
              {book.description}
            </p>
          </div>

          {/* Book Information Grid */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
              Book Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Publisher</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{book.publisher}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Publication Year</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{book.publication_year}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Pages</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{book.pages} pages</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Globe size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Language</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{book.language}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Hash size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ISBN</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>{book.isbn}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Copy size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Inventory Copies</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{book.total_copies} Copies</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        title="Borrow Book Confirmation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBorrowModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmBorrow} isLoading={actionLoading}>
              Confirm Borrow (14 Days)
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          You are borrowing <strong>"{book.title}"</strong>. The standard loan period is 14 days. Please make sure to return or renew before the due date to avoid overdue charges.
        </p>
      </Modal>

      {/* Reserve Confirmation Modal */}
      <Modal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        title="Place Reservation Waitlist"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReserveModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReserve} isLoading={actionLoading}>
              Confirm Reservation
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          All copies of <strong>"{book.title}"</strong> are currently on loan. Confirming will place you on the automated waitlist queue.
        </p>
      </Modal>
    </div>
  );
};
