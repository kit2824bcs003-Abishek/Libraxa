import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Clock,
  CreditCard,
  Search,
  Layers,
  FileText,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Users,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { DashboardData } from '../types';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [readingModalBook, setReadingModalBook] = useState<any | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(false);
        const res = await api.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your library dashboard..." />;
  }

  if (error || !data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Unable to load dashboard'}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{data.header.greeting}</h1>
            <p className="page-subtitle">{data.header.subtitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--navy)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              📅 {data.header.current_semester}
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--success)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span className="status-dot" />
              Account Status: {data.header.library_status}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="stat-grid">
        <StatCard
          label="Books Borrowed"
          value={data.stats.books_borrowed.value}
          subtext={data.stats.books_borrowed.subtext}
          icon={<BookMarked size={20} />}
          iconVariant="primary"
        />
        <StatCard
          label="Currently Reading"
          value={data.stats.currently_reading.value}
          subtext={data.stats.currently_reading.subtext}
          icon={<BookOpen size={20} />}
          iconVariant="navy"
        />
        <StatCard
          label="Due This Week"
          value={data.stats.due_this_week.value}
          subtext={data.stats.due_this_week.subtext}
          icon={<Clock size={20} />}
          iconVariant="warning"
        />
        <StatCard
          label="Outstanding Fine"
          value={data.stats.outstanding_fine.value}
          subtext={data.stats.outstanding_fine.subtext}
          icon={<CreditCard size={20} />}
          iconVariant="success"
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="card" style={{ marginBottom: 32, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ Quick Actions
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Search size={15} />}
              onClick={() => navigate('/books')}
            >
              Search Books
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<BookMarked size={15} />}
              onClick={() => navigate('/borrowed')}
            >
              Borrowed Books
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Layers size={15} />}
              onClick={() => navigate('/reservations')}
            >
              Reservations
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText size={15} />}
              onClick={() => setRulesModalOpen(true)}
            >
              Library Rules
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Currently Reading & Upcoming Returns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28, marginBottom: 32 }}>
        {/* Currently Reading */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📖 Currently Reading</h3>
            <Link to="/borrowed" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {data.currently_reading.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active reading loans.</p>
            ) : (
              data.currently_reading.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: 14,
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    style={{
                      width: 58,
                      height: 84,
                      objectFit: 'cover',
                      borderRadius: 6,
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.3, marginBottom: 2 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.author}</p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Progress: {item.progress}%</span>
                        <span>Due: {item.due_date.split(' ')[0]}</span>
                      </div>
                      <ProgressBar progress={item.progress} />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setReadingModalBook(item)}
                      >
                        Continue Reading
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏰ Upcoming Returns</h3>
            <Link to="/calendar" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              Full calendar
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.upcoming_returns.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No books due soon.</p>
            ) : (
              data.upcoming_returns.map((ret) => (
                <div
                  key={ret.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={ret.cover_url}
                      alt={ret.title}
                      style={{ width: 42, height: 56, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {ret.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due {ret.due_at.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  <div>
                    {ret.days_remaining <= 2 ? (
                      <Badge variant="warning">{ret.status_text}</Badge>
                    ) : (
                      <Badge variant="neutral">{ret.status_text}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics & Insights Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28, marginBottom: 32 }}>
        {/* Monthly Borrowing Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📊 Borrowing Activity (2026)</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Monthly checkout volumes</p>
            </div>
            <Badge variant="primary">Campus Trend</Badge>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingTop: 20 }}>
              {data.monthly_borrowing.map((m) => {
                const max = 400;
                const heightPct = Math.round((m.count / max) * 100);
                return (
                  <div
                    key={m.month}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {m.count}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: `${heightPct}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Library Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Library Insights</h3>
            <Compass size={18} color="var(--primary)" />
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 14, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Most Borrowed Category
              </span>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                {data.insights.most_borrowed_category}
              </p>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Most Popular Book
              </span>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={data.insights.most_popular_book}>
                Clean Code
              </p>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Books Available
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>
                {data.insights.books_available.toLocaleString()}
              </p>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Borrowers
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>
                {data.insights.active_borrowers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🕒 Recent Activity</h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Updated real-time</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{act.action}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{act.item}</span>
                    </td>
                    <td>
                      <Badge variant="primary">{act.badge}</Badge>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {act.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Library Rules Modal */}
      <Modal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        title="LIBRIXA Library Rules & Borrowing Guidelines"
        footer={
          <Button variant="primary" onClick={() => setRulesModalOpen(false)}>
            Understood
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Loan Duration:</strong> Regular books can be checked out for a duration of 14 consecutive days.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Renewals:</strong> Active loans may be renewed once for an additional 14 days if no waitlist reservation is pending.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Overdue Fines:</strong> A nominal late fee of ₹5 per day applies to items returned after the recorded due date.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Reservations:</strong> Students can reserve checked-out books. When returned, items are held for 48 hours for the waitlist leader.
            </div>
          </div>
        </div>
      </Modal>

      {/* Continue Reading Modal */}
      {readingModalBook && (
        <Modal
          isOpen={!!readingModalBook}
          onClose={() => setReadingModalBook(null)}
          title={`Reading: ${readingModalBook.title}`}
          footer={
            <Button variant="primary" onClick={() => setReadingModalBook(null)}>
              Close Reader
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              By <strong>{readingModalBook.author}</strong> • Progress: <strong>{readingModalBook.progress}%</strong>
            </p>
            <ProgressBar progress={readingModalBook.progress} />
            <div
              style={{
                padding: 16,
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                lineHeight: 1.7,
                color: 'var(--text-main)',
                fontStyle: 'italic',
                borderLeft: '4px solid var(--primary)',
              }}
            >
              "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. Clean code always looks like it was written by someone who cares."
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Personal notes and highlights are saved to your student profile.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
