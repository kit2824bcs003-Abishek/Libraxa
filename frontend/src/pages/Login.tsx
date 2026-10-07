import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('student@librixa.edu');
  const [password, setPassword] = useState('student123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back to LIBRIXA!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      {/* LEFT SPLIT: Brand Visual */}
      <div
        style={{
          flex: 1.1,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '48px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
        }}
        id="login-brand-panel"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.svg" alt="LIBRIXA Logo" style={{ width: 44, height: 44, borderRadius: 10 }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                LIBRIXA
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Smart Library Management
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 520, margin: '48px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#A5B4FC',
              marginBottom: 24,
            }}
          >
            <Sparkles size={16} />
            <span>Next-Generation Academic Knowledge System</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.03em' }}>
            Your knowledge, organized.
          </h1>

          <p style={{ fontSize: '1.0625rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 36 }}>
            Discover, borrow, manage and explore knowledge through one intelligent library platform built for university campuses.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              padding: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>12,500+</span>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Academic Titles & Journals</p>
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8' }}>99.8%</span>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Automated Check-in Efficiency</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 20 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            © 2026 LIBRIXA Campus Systems. All rights reserved.
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Protected by Modern JWT Authentication
          </span>
        </div>
      </div>

      {/* RIGHT SPLIT: Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          maxWidth: 620,
          margin: '0 auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Sign in to continue to LIBRIXA.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.875rem',
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@librixa.edu"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              required
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '16px 0 24px',
                fontSize: '0.875rem',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--navy)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                Remember me
              </label>

              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', height: 46 }}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: 20, padding: 14, backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
              ⚡ Quick Demo Credentials
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('student@librixa.edu', 'student123')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--navy)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('librarian@librixa.edu', 'library123')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--navy)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                📚 Librarian / Admin
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
            <span style={{ padding: '0 12px', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            style={{ width: '100%', height: 44, color: 'var(--navy)' }}
            onClick={() => showToast('Google Campus Single Sign-On simulated for demo', 'info')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </Button>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
