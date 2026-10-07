import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <img src="/logo.svg" alt="LIBRIXA Logo" style={{ width: 38, height: 38, borderRadius: 8 }} />
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            LIBRIXA
          </span>
        </Link>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
          Forgot your password?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Enter your registered email to receive password reset instructions.
        </p>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Check Your Inbox
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Password reset instructions have been sent to your email.
            </p>
            <Link to="/login">
              <Button variant="primary" style={{ width: '100%' }}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <Input
              label="Registered Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@librixa.edu"
              icon={<Mail size={18} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', height: 46, marginTop: 12 }}
            >
              Send Reset Link
            </Button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
