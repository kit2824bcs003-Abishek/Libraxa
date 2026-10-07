import React, { useState, useEffect } from 'react';
import { User, Mail, IdCard, Building2, BookMarked, CheckCircle2, Layers, CreditCard, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'Computer Science & Engineering',
    student_id: user?.student_id || '',
  });

  const departments = [
    { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics & Communication', label: 'Electronics & Communication' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Other', label: 'Other' },
  ];

  const fetchProfileStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        setStats(res.data.stats);
        if (res.data.user) {
          setFormData({
            name: res.data.user.name,
            department: res.data.user.department || 'Computer Science & Engineering',
            student_id: res.data.user.student_id || '',
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.data) {
        updateUser(res.data);
        showToast('Profile updated successfully!', 'success');
        setEditModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading student profile..." />;
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SK';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Student Profile</h1>
        <p className="page-subtitle">
          Manage your personal university credentials, contact records, and library statistics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '1.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {initials}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
            {user?.name || 'Shivanand K'}
          </h3>

          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 20,
            }}
          >
            {user?.role || 'Student'}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--navy)' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--navy)' }}>
              <IdCard size={16} color="var(--text-muted)" />
              <span>{user?.student_id || 'CSE2026042'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--navy)' }}>
              <Building2 size={16} color="var(--text-muted)" />
              <span>{user?.department || 'Computer Science & Engineering'}</span>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <Button
              variant="outline"
              size="md"
              icon={<Edit3 size={15} />}
              style={{ width: '100%' }}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Academic Stats & Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <BookMarked size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Borrowed</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
                {stats?.books_borrowed || 4}
              </span>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Returned Books</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
                {stats?.books_returned || 1}
              </span>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
                  <Layers size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reservations</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
                {stats?.active_reservations || 1}
              </span>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                  <CreditCard size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Fines</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
                ₹{stats?.outstanding_fines || 0}
              </span>
            </div>
          </div>

          {/* Academic Card Information */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              🎓 Campus Library Membership Card
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Your digital library identity barcode is active and recognized across the Central Library, Engineering Annex, and digital research archives.
            </p>

            <div
              style={{
                padding: 16,
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Barcode ID
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy)', letterSpacing: '0.08em' }}>
                  ||| |||| || ||||| ||| ||
                </p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {user?.student_id || 'CSE2026042'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Expiry Date</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>July 2027</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Library Profile"
      >
        <form onSubmit={handleSaveProfile}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Student ID"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            placeholder="CSE2026XXX"
          />

          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={departments}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} icon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
