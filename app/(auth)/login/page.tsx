'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPreview } from '@/components/auth/appPreview';
import { WavyBackground } from '@/components/auth/wavyBackground';
import { EyeIcon } from '@/components/auth/eyeIcon';
import { ObliqLogo } from '@/components/auth/obliq';
import { loginAndBootstrap } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await loginAndBootstrap({ email, password });
      setAuth(session.user, session.accessToken, session.permissions);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        /* ── Reset & base ──────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px;
          background: #fdf9f7;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }

        /* ── Left panel ────────────────────────────────── */
        .left-panel {
          width: 100%;
          max-width: none;
          min-height: calc(100vh - 32px);
          display: flex;
          flex-direction: column;
          padding: 36px 48px;
          position: relative;
          z-index: 1;
        }

        /* ── Logo ──────────────────────────────────────── */
        .obliq-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: auto;
        }
        .logo-icon { display: flex; align-items: center; }
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #1a1208;
          letter-spacing: -0.3px;
        }

        /* ── Form wrapper ──────────────────────────────── */
        .form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .card-heading {
          text-align: center;
          margin-bottom: 32px;
        }
        .card-heading h1 {
          font-size: 26px;
          font-weight: 700;
          color: #111111;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .card-heading p {
          font-size: 13.5px;
          color: #9a9a9a;
          font-weight: 400;
        }

        /* ── Form fields ───────────────────────────────── */
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: #2d2d2d;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }
        .form-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1.5px solid #e8e4df;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          color: #1a1a1a;
          background: #fafaf9;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .form-input::placeholder { color: #b8b4ae; }
        .form-input:focus {
          border-color: #e8541a;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(232, 84, 26, 0.1);
        }
        .form-input.has-icon { padding-right: 44px; }

        .input-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #b0aba4;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .input-icon-btn:hover { color: #6b6560; }

        /* ── Remember / Forgot row ─────────────────────── */
        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13.5px;
          color: #5a5a5a;
          font-weight: 400;
          user-select: none;
        }
        .custom-checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid #d0cbc4;
          border-radius: 4px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s;
        }
        .custom-checkbox.checked {
          background: #e8541a;
          border-color: #e8541a;
        }
        .custom-checkbox.checked::after {
          content: '';
          width: 9px;
          height: 6px;
          border-left: 2px solid white;
          border-bottom: 2px solid white;
          transform: rotate(-45deg) translateY(-1px);
          display: block;
        }

        .forgot-link {
          font-size: 13.5px;
          font-weight: 500;
          color: #e8541a;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: #c43e0e; }

        /* ── Login button ──────────────────────────────── */
        .login-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #f06030 0%, #e03a10 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.1px;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(224, 80, 20, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(224, 80, 20, 0.45);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(224, 80, 20, 0.3);
        }
        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ── Spinner ───────────────────────────────────── */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Error ─────────────────────────────────────── */
        .error-box {
          margin-bottom: 18px;
          padding: 11px 14px;
          background: #fff1f0;
          border: 1px solid #ffd0cc;
          border-radius: 10px;
          font-size: 13.5px;
          color: #c53030;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Sign up ───────────────────────────────────── */
        .signup-row {
          text-align: center;
          margin-top: 24px;
          font-size: 13.5px;
          color: #9a9a9a;
        }
        .signup-row a {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .signup-row a:hover { color: #e8541a; }

        /* ── Right panel ───────────────────────────────── */
        .right-panel {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          min-height: calc(100vh - 32px);
          animation: slideInRightPanel 0.6s ease-out both;
        }

        @keyframes slideInRightPanel {
          from {
            opacity: 0;
            transform: translateX(72px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .wavy-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── App preview card ──────────────────────────── */
        .preview-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .app-preview-card {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 540px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.25);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.8);
        }

        /* Preview header */
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid #f0ece8;
          background: #fafaf9;
        }
        .preview-logo {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .preview-logo-icon {
          width: 20px; height: 20px;
          background: linear-gradient(135deg, #f06030, #e03a10);
          border-radius: 6px;
        }
        .preview-logo-label {
          font-size: 12px;
          font-weight: 600;
          color: #2a2a2a;
        }
        .preview-header-actions {
          display: flex; gap: 5px;
        }
        .preview-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #e0dbd4;
        }

        /* Preview body */
        .preview-body {
          display: flex;
          height: 420px;
        }

        /* Preview sidebar */
        .preview-sidebar {
          width: 160px;
          flex-shrink: 0;
          border-right: 1px solid #f0ece8;
          padding: 12px 8px;
          overflow: hidden;
          background: #fff;
        }

        .preview-workspace {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 6px 10px;
          border-bottom: 1px solid #f0ece8;
          margin-bottom: 8px;
        }
        .preview-avatar {
          width: 22px; height: 22px;
          border-radius: 6px;
          background: linear-gradient(135deg, #f0a060, #e05020);
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-workspace-name {
          font-size: 10px;
          font-weight: 600;
          color: #2a2a2a;
          line-height: 1.2;
        }
        .preview-workspace-id {
          font-size: 8.5px;
          color: #b0a89e;
        }

        .preview-nav-item {
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: #7a7068;
          margin-bottom: 1px;
          cursor: default;
        }
        .preview-nav-item.active {
          background: #fff4ef;
          color: #e05020;
          font-weight: 500;
        }
        .preview-badge-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-badge {
          background: #e05020;
          color: white;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          padding: 1px 5px;
        }
        .preview-section-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #c0b8b0;
          padding: 8px 8px 3px;
        }

        /* Preview content */
        .preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #fafaf9;
        }

        .preview-content-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px 8px;
          border-bottom: 1px solid #f0ece8;
          background: white;
        }
        .preview-back { font-size: 13px; color: #9a9590; cursor: pointer; }
        .preview-page-title { font-size: 13px; font-weight: 600; color: #1a1a1a; }

        .preview-search-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-bottom: 1px solid #f0ece8;
          background: white;
        }
        .preview-search-icon { font-size: 12px; color: #b0a8a0; }
        .preview-search-text { font-size: 11px; color: #c0b8b0; flex: 1; }
        .preview-view-tabs { display: flex; gap: 2px; margin-left: auto; }
        .preview-tab {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 6px;
          color: #9a9590;
          cursor: pointer;
        }
        .preview-tab.active {
          background: #fff4ef;
          color: #e05020;
          font-weight: 500;
        }

        .preview-group { padding: 10px 14px 4px; }
        .preview-group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .preview-group-dot {
          width: 10px; height: 10px;
          border-radius: 2px;
        }
        .preview-group-dot.blue { background: #3b82f6; }
        .preview-group-dot.purple { background: #8b5cf6; }
        .preview-group-title { font-size: 11px; font-weight: 600; color: #2a2a2a; }

        .preview-col-headers {
          display: grid;
          grid-template-columns: 1fr 90px 64px 48px;
          gap: 4px;
          padding: 0 4px 4px;
          font-size: 9.5px;
          font-weight: 500;
          color: #b0a8a0;
          border-bottom: 1px solid #f0ece8;
          margin-bottom: 2px;
        }

        .preview-row {
          display: grid;
          grid-template-columns: 1fr 90px 64px 48px;
          gap: 4px;
          align-items: center;
          padding: 4px 4px;
          border-bottom: 1px solid #f8f4f0;
          font-size: 10px;
        }
        .preview-row-check {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .preview-check {
          width: 12px; height: 12px;
          border: 1.5px solid #d0cac4;
          border-radius: 3px;
          flex-shrink: 0;
          position: relative;
        }
        .preview-check.checked {
          background: #e05020;
          border-color: #e05020;
        }
        .preview-check.checked::after {
          content: '✓';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: white;
          font-weight: 700;
        }
        .preview-row-title {
          font-size: 10.5px;
          color: #3a3a3a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-row-client { font-size: 10px; color: #7a7068; }
        .preview-priority-badge {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
        }
        .preview-row-date { font-size: 10px; color: #b0a8a0; }

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 1024px) {
          .login-page {
            display: block;
            padding: 0;
          }
          .right-panel { display: none; }
          .left-panel {
            max-width: 100%;
            min-height: 100vh;
            border-radius: 0;
            padding: 32px 24px;
          }
          .form-container { padding: 20px 0; }
        }
        @media (max-width: 480px) {
          .left-panel { padding: 24px 16px; }
          .login-card { padding: 28px 20px; }
        }

        /* ── Fade-in animation ─────────────────────────── */
        .login-card {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-page">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <ObliqLogo />
        
          <div className="form-container">
            <div className="login-card">
              <div className="card-heading">
                <h1>Login</h1>
                <p>Enter your details to continue</p>
              </div>

              {error && (
                <div className="error-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-input has-icon"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-icon-btn"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="form-row">
                  <label
                    className="remember-label"
                    onClick={() => setRemember(!remember)}
                  >
                    <div className={`custom-checkbox ${remember ? 'checked' : ''}`} />
                    Remember me
                  </label>
                  <button type="button" className="forgot-link">
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </button>
              </form>

              {/* Sign up */}
              <div className="signup-row">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <WavyBackground />
          <div className="preview-wrapper">
            <AppPreview />
          </div>
        </div>
      </div>
    </>
  );
}