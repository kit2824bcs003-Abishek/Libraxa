import React, { useState } from 'react';
import { Bell, Shield, Palette, User, Check, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'security'>('notifications');

  // Toggle states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dueDateReminders, setDueDateReminders] = useState(true);
  const [holdNotifications, setHoldNotifications] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(false);
  const [compactCards, setCompactCards] = useState(false);

  // Security password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean, label: string) => {
    setter(!current);
    showToast(`${label} ${!current ? 'enabled' : 'disabled'}.`, 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Password updated successfully (Simulation)', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">
          Configure notification preferences, UI appearance options, and security credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <Bell size={16} />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <Palette size={16} />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <Shield size={16} />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card" style={{ padding: 28 }}>
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Notification Preferences
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Choose when and how LIBRIXA communicates essential library updates to you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--navy)', display: 'block' }}>
                      Due Date Reminders
                    </strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Receive alert notifications 48 hours before your book loan expiration date.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dueDateReminders}
                    onChange={() => handleToggle(setDueDateReminders, dueDateReminders, 'Due date reminders')}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--navy)', display: 'block' }}>
                      Reservation & Hold Updates
                    </strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Get notified as soon as a waitlisted book is checked in and ready for pickup.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={holdNotifications}
                    onChange={() => handleToggle(setHoldNotifications, holdNotifications, 'Hold notifications')}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--navy)', display: 'block' }}>
                      Campus Academic Digest
                    </strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Monthly digest of newly acquired textbooks, ACM publications, and workshops.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={monthlyDigest}
                    onChange={() => handleToggle(setMonthlyDigest, monthlyDigest, 'Monthly digest')}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Display & Interface
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Customize your LIBRIXA catalog view and reading workspace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--navy)', display: 'block' }}>
                      High-Density Catalog Cards
                    </strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Show more book items per row with compact information grids.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactCards}
                    onChange={() => handleToggle(setCompactCards, compactCards, 'Compact view')}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--navy)', display: 'block', marginBottom: 6 }}>
                    Theme Accent
                  </strong>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#4F46E5', border: '3px solid #CBD5E1', cursor: 'pointer' }} title="Indigo (Default)" />
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0284C7', opacity: 0.6, cursor: 'pointer' }} title="Sky" />
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#059669', opacity: 0.6, cursor: 'pointer' }} title="Emerald" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Security & Authentication
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Update your account password and review authentication sessions.
              </p>

              <form onSubmit={handlePasswordChange} style={{ maxWidth: 440 }}>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  icon={<Key size={16} />}
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  icon={<Key size={16} />}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  icon={<Key size={16} />}
                />

                <Button type="submit" variant="primary" style={{ marginTop: 12 }}>
                  Update Password
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
