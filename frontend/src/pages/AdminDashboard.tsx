import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Library,
  BookOpen,
  BookMarked,
  AlertTriangle,
  Users,
  CreditCard,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../services/api';
import { AdminStats } from '../types';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminDashboard()
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading librarian portal metrics..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#4338CA',
                  backgroundColor: '#EEF2FF',
                  padding: '3px 10px',
                  borderRadius: 9999,
                }}
              >
                Staff Portal
              </span>
            </div>
            <h1 className="page-title">Librarian Command Center</h1>
            <p className="page-subtitle">
              Monitor inventory levels, circulation rates, loan compliance, and campus student accounts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/books">
              <Button variant="primary" icon={<PlusCircle size={16} />}>
                Manage Catalog
              </Button>
            </Link>
            <Link to="/admin/borrowings">
              <Button variant="secondary" icon={<BookMarked size={16} />}>
                Active Loans
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Books"
          value={stats?.total_books || 0}
          subtext={`${stats?.total_titles || 0} unique catalog titles`}
          icon={<Library size={20} />}
          iconVariant="primary"
        />
        <StatCard
          label="Available Books"
          value={stats?.available_books || 0}
          subtext="Ready for checkout"
          icon={<BookOpen size={20} />}
          iconVariant="success"
        />
        <StatCard
          label="Borrowed Books"
          value={stats?.borrowed_books || 0}
          subtext="Currently with students"
          icon={<BookMarked size={20} />}
          iconVariant="navy"
        />
        <StatCard
          label="Overdue Books"
          value={stats?.overdue_books || 0}
          subtext="Needs reminder"
          icon={<AlertTriangle size={20} />}
          iconVariant="warning"
        />
        <StatCard
          label="Registered Students"
          value={stats?.registered_students || 0}
          subtext="Active library cards"
          icon={<Users size={20} />}
          iconVariant="primary"
        />
        <StatCard
          label="Total Fines"
          value={`₹${stats?.total_fines || 0}`}
          subtext="Accumulated ledger"
          icon={<CreditCard size={20} />}
          iconVariant="navy"
        />
      </div>

      {/* Quick Administration Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 12 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Library size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)' }}>
                Catalog & Book Inventory
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Add new arrivals, update copy numbers, edit metadata.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: 20 }}>
            Manage the complete repository of physical and digital publications, assign classifications, and track shelf stock.
          </p>
          <Link to="/admin/books">
            <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
              Open Book Management
            </Button>
          </Link>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
              <BookMarked size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)' }}>
                Circulation & Loan Records
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review active checkouts, process manual check-ins.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: 20 }}>
            View real-time records across all university departments, extend due dates, and inspect overdue return fees.
          </p>
          <Link to="/admin/borrowings">
            <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
              Open Circulation Ledger
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
