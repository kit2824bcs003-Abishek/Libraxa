import React, { useState, useEffect } from 'react';
import { BookMarked, CheckCircle, Clock, AlertTriangle, CalendarPlus, Search, User } from 'lucide-react';
import api from '../services/api';
import { Borrowing } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const AdminBorrowings: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  const fetchBorrowings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminBorrowings();
      if (res.success && res.data) {
        setBorrowings(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch borrowing records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleMarkReturned = async (id: number) => {
    try {
      await api.adminMarkReturned(id);
      showToast('Book marked as returned by staff.', 'success');
      fetchBorrowings();
    } catch (err: any) {
      showToast(err.message || 'Failed to process return', 'error');
    }
  };

  const handleExtendDue = async (id: number) => {
    try {
      await api.adminExtendDue(id, 14);
      showToast('Loan due date extended by 14 days.', 'success');
      fetchBorrowings();
    } catch (err: any) {
      showToast(err.message || 'Failed to extend loan', 'error');
    }
  };

  const filteredBorrowings = borrowings.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.book_title.toLowerCase().includes(term) ||
      (b.student_name && b.student_name.toLowerCase().includes(term)) ||
      (b.student_id && b.student_id.toLowerCase().includes(term)) ||
      (b.student_email && b.student_email.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Circulation & Loan Ledger</h1>
        <p className="page-subtitle">
          Monitor all active campus loans, verify physical item check-ins, and manage student extensions.
        </p>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student name, student ID, email, or book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 42,
              paddingRight: 16,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading circulation ledger..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th style={{ textAlign: 'right' }}>Staff Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowings.map((b) => {
                  const isActive = b.status === 'borrowed' || b.status === 'overdue';
                  return (
                    <tr key={b.id}>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--navy)', display: 'block' }}>
                            {b.student_name || 'Student'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {b.student_id ? `${b.student_id} • ` : ''}
                            {b.student_email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--navy)' }}>{b.book_title}</strong>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {b.borrowed_at.split(' ')[0]}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 600 }}>
                        {b.due_at.split(' ')[0]}
                      </td>
                      <td>
                        {b.status === 'returned' ? (
                          <Badge variant="neutral">Returned</Badge>
                        ) : b.status === 'overdue' ? (
                          <Badge variant="danger" icon={<AlertTriangle size={12} />}>
                            Overdue
                          </Badge>
                        ) : (
                          <Badge variant="success" icon={<Clock size={12} />}>
                            Active Loan
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
                              icon={<CalendarPlus size={13} />}
                              onClick={() => handleExtendDue(b.id)}
                            >
                              +14 Days
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle size={13} />}
                              onClick={() => handleMarkReturned(b.id)}
                            >
                              Check In
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Closed ({b.returned_at ? b.returned_at.split(' ')[0] : 'Done'})
                          </span>
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
    </div>
  );
};
