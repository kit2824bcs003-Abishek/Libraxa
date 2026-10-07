import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, RefreshCw, CheckCircle, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api';
import { Borrowing } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const BorrowedBooks: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchBorrowings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyBorrowings();
      if (res.success && res.data) {
        setBorrowings(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load borrowed books', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleRenew = async (borrowing: Borrowing) => {
    try {
      const res = await api.renewBook(borrowing.id);
      showToast(res.message || 'Book renewed successfully! Due date extended by 14 days.', 'success');
      fetchBorrowings();
    } catch (err: any) {
      showToast(err.message || 'Cannot renew book', 'error');
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnTarget) return;
    setActionLoading(true);
    try {
      const res = await api.returnBook(returnTarget.id);
      const fine = res.data?.fine_amount;
      if (fine > 0) {
        showToast(`Book returned. An overdue fine of ₹${fine} has been issued.`, 'info');
      } else {
        showToast('Book returned successfully.', 'success');
      }
      setReturnTarget(null);
      fetchBorrowings();
    } catch (err: any) {
      showToast(err.message || 'Failed to return book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Borrowed Books</h1>
        <p className="page-subtitle">
          Manage your active book loans, track upcoming due dates, and renew titles online.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Retrieving your borrowing records..." />
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={28} />}
          title="No Borrowed Books"
          description="You currently don't have any borrowed books. Discover thousands of textbooks and research volumes in the catalog."
          actionText="Browse Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => {
                  const isActive = b.status === 'borrowed';
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img
                            src={b.book_cover}
                            alt={b.book_title}
                            style={{ width: 44, height: 62, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                          />
                          <div>
                            <Link
                              to={`/books/${b.book_id}`}
                              style={{ fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 2 }}
                            >
                              {b.book_title}
                            </Link>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              {b.book_author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {b.borrowed_at.split(' ')[0]}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: b.is_overdue ? 'var(--danger)' : 'var(--navy)' }}>
                            {b.due_at.split(' ')[0]}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '0.75rem', color: b.is_overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                              {b.is_overdue
                                ? `${b.overdue_days} days overdue`
                                : `${b.days_remaining} days remaining`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {b.status === 'returned' ? (
                          <Badge variant="neutral">Returned</Badge>
                        ) : b.is_overdue ? (
                          <Badge variant="danger" icon={<AlertTriangle size={12} />}>
                            Overdue
                          </Badge>
                        ) : (
                          <Badge variant="success" icon={<Clock size={12} />}>
                            On Loan
                          </Badge>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: b.fine_amount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                          ₹{b.fine_amount}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isActive ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<RefreshCw size={13} />}
                              onClick={() => handleRenew(b)}
                            >
                              Renew
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle size={13} />}
                              onClick={() => setReturnTarget(b)}
                            >
                              Return
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returnTarget && (
        <Modal
          isOpen={!!returnTarget}
          onClose={() => setReturnTarget(null)}
          title="Return Book Confirmation"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReturnTarget(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReturn} isLoading={actionLoading}>
                Confirm Return
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              Are you sure you want to return <strong>"{returnTarget.book_title}"</strong>?
            </p>
            {returnTarget.is_overdue && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger)',
                  fontSize: '0.8125rem',
                }}
              >
                ⚠️ Note: This book is {returnTarget.overdue_days} days overdue. A late fee of ₹
                {(returnTarget.overdue_days || 0) * 5} (₹5/day) will be calculated and posted to your fines ledger.
              </div>
            )}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Upon confirmation, the book copy will be returned to library inventory and made available to other students.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
