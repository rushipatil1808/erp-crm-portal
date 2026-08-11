import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, Zap, Users, Package, FileText, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/common/Logo';

interface DemoAccount {
  role: Role;
  email: string;
  label: string;
  badgeStyle: {
    bg: string;
    border: string;
    color: string;
  };
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123');
    setIsSubmitting(true);
    setError(null);
    try {
      await login(roleEmail, 'Password123');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts: DemoAccount[] = [
    {
      role: 'ADMIN',
      email: 'admin@erp.com',
      label: 'System Admin',
      badgeStyle: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
    },
    {
      role: 'SALES',
      email: 'sales@erp.com',
      label: 'Sales Staff',
      badgeStyle: { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
    },
    {
      role: 'WAREHOUSE',
      email: 'warehouse@erp.com',
      label: 'Warehouse Mgr',
      badgeStyle: { bg: '#fffbe6', border: '#ffe58f', color: '#b45309' },
    },
    {
      role: 'ACCOUNTS',
      email: 'accounts@erp.com',
      label: 'Accounts Exec',
      badgeStyle: { bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          minHeight: '620px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <Logo size={42} showText={true} subtitle="Wholesale & CRM Portal" />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Welcome Back
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.375rem' }}>
                Enter your work email and password to access your account.
              </p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ fontWeight: 600, color: '#334155' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    style={{
                      paddingLeft: '2.5rem',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      paddingLeft: '2.5rem',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating...' : 'Log In'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: '#475569' }}>
                <Zap size={15} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Or 1-Click Role Login:
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    className="btn"
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: acc.badgeStyle.bg,
                      border: `1px solid ${acc.badgeStyle.border}`,
                      color: acc.badgeStyle.color,
                      justifyContent: 'flex-start',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    <ShieldCheck size={14} style={{ color: acc.badgeStyle.color }} />
                    <span>{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2rem' }}>
            Copyright © 2026 Mini ERP + CRM Portal. All Rights Reserved.
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            padding: '3rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <h2 style={{ fontSize: '2.125rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Effortlessly manage your team and operations.
            </h2>
            <p style={{ fontSize: '0.9375rem', opacity: 0.9, lineHeight: 1.5, maxWidth: '420px', marginBottom: '2rem' }}>
              Log in to access your CRM dashboard, manage inventory stock, and process sales challans seamlessly.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '16px',
              padding: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ERP PORTAL PREVIEW
              </span>
              <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} style={{ color: '#4ade80' }} /> Live System Active
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.625rem', borderRadius: '8px', textAlign: 'center' }}>
                <Users size={16} style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Customers</div>
                <strong style={{ fontSize: '1rem' }}>124 Active</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.625rem', borderRadius: '8px', textAlign: 'center' }}>
                <Package size={16} style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Inventory</div>
                <strong style={{ fontSize: '1rem' }}>Catalog SKUs</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.625rem', borderRadius: '8px', textAlign: 'center' }}>
                <FileText size={16} style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Challans</div>
                <strong style={{ fontSize: '1rem' }}>Auto #CH</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
