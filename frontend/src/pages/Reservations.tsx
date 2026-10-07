import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Bookmark, XCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import { Reservation } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyReservations();
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve reservations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    try {
      await api.cancelReservation(id);
      showToast('Reservation cancelled successfully.', 'success');
      fetchReservations();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel reservation', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Book Reservations</h1>
        <p className="page-subtitle">
          Track hold requests for books currently checked out by other university members.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading reservations..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<Layers size={28} />}
          title="No Active Reservations"
          description="You do not have any waitlist reservations placed right now. You can reserve any book from the catalog if all copies are checked out."
          actionText="Explore Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reserved Book</th>
                  <th>Reservation Date</th>
                  <th>Waitlist Position</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const isActive = r.status === 'active';
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img
                            src={r.book_cover}
                            alt={r.book_title}
                            style={{ width: 44, height: 62, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                          />
                          <div>
                            <Link
                              to={`/books/${r.book_id}`}
                              style={{ fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 2 }}
                            >
                              {r.book_title}
                            </Link>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              {r.book_author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {r.reserved_at.split(' ')[0]}
                      </td>
                      <td>
                        {isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                            }}
                          >
                            Queue #{r.queue_position || 1}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>-</span>
                        )}
                      </td>
                      <td>
                        {r.status === 'active' ? (
                          <Badge variant="warning" icon={<Clock size={12} />}>
                            Waiting
                          </Badge>
                        ) : r.status === 'fulfilled' ? (
                          <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                            Fulfilled
                          </Badge>
                        ) : (
                          <Badge variant="neutral">Cancelled</Badge>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<XCircle size={14} />}
                            onClick={() => handleCancel(r.id)}
                            style={{ color: 'var(--danger)' }}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Archived</span>
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
