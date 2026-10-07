import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Fine, FinesSummary } from '../types';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const Fines: React.FC = () => {
  const [summary, setSummary] = useState<FinesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payingFine, setPayingFine] = useState<Fine | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyFines();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve fines data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePayFine = async () => {
    if (!payingFine) return;
    setActionLoading(true);
    try {
      await api.payFine(payingFine.id);
      showToast('Payment recorded successfully. Fine marked as settled.', 'success');
      setPayingFine(null);
      fetchFines();
    } catch (err: any) {
      showToast(err.message || 'Payment simulation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Library Fines & Settlements</h1>
        <p className="page-subtitle">
          View overdue fees, past settlement receipts, and clear pending dues digitally.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading fines records..." />
      ) : !summary ? (
        <EmptyState title="No Records" description="No fine details found." />
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <StatCard
              label="Outstanding Fine"
              value={`₹${summary.outstanding}`}
              subtext={summary.outstanding === 0 ? 'No pending dues' : 'Requires settlement'}
              icon={<CreditCard size={20} />}
              iconVariant={summary.outstanding === 0 ? 'success' : 'warning'}
            />
            <StatCard
              label="Settled / Paid"
              value={`₹${summary.paid}`}
              subtext="Historical cleared fines"
              icon={<CheckCircle2 size={20} />}
              iconVariant="primary"
            />
            <StatCard
              label="Lifetime Total"
              value={`₹${summary.total}`}
              subtext="All assessed penalties"
              icon={<CreditCard size={20} />}
              iconVariant="navy"
            />
          </div>

          {/* Fines Table */}
          {summary.fines.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                Account in Good Standing
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                You have no overdue penalties or outstanding library fees.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-header">
                <h3 className="card-title">Fines Transaction Ledger</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Rate: ₹5.00 / overdue day
                </span>
              </div>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book / Item</th>
                      <th>Due Date</th>
                      <th>Returned Date</th>
                      <th>Overdue Days</th>
                      <th>Fine Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.fines.map((f) => {
                      const isPending = f.status === 'pending';
                      return (
                        <tr key={f.id}>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                              {f.book_title || 'Overdue Book Return'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {f.due_at ? f.due_at.split(' ')[0] : 'N/A'}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {f.returned_at ? f.returned_at.split(' ')[0] : 'Pending Return'}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {f.overdue_days || Math.ceil(f.amount / 5)} days
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: isPending ? 'var(--danger)' : 'var(--navy)' }}>
                              ₹{f.amount}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <Badge variant="danger" icon={<AlertTriangle size={12} />}>
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                                Paid
                              </Badge>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isPending ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setPayingFine(f)}
                              >
                                Pay Fine
                              </Button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Cleared on {f.paid_at ? f.paid_at.split(' ')[0] : 'receipt'}
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
      )}

      {/* Pay Fine Modal Simulation */}
      {payingFine && (
        <Modal
          isOpen={!!payingFine}
          onClose={() => setPayingFine(null)}
          title="Digital Fine Settlement"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPayingFine(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handlePayFine} isLoading={actionLoading}>
                Simulate Payment (₹{payingFine.amount})
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 16, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fine Assessment:</span>
                <strong style={{ color: 'var(--navy)' }}>#{payingFine.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Associated Item:</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem' }}>
                  {payingFine.book_title || 'Overdue Loan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Due:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{payingFine.amount}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 Simulated university payment gateway (College Demo mode). Clicking confirm records the transaction instantly in the database.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
