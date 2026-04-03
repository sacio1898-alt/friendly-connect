import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, bindReferral } from '@/hooks/useFirestoreData';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, register, resetPassword } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isReset) {
        await resetPassword(form.email);
        setSuccess('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!');
      } else {
        try {
          await login(form.email, form.password);
          navigate('/');
        } catch (err: any) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              const name = form.email.split('@')[0];
              await register(form.email, form.password, name);
              const currentUser = getAuth().currentUser;
              if (refCode && currentUser?.uid) {
                try { await bindReferral(currentUser.uid, refCode); } catch {}
              }
              navigate('/');
            } catch (regErr: any) {
              if (regErr.code === 'auth/email-already-in-use') {
                setError('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
              } else {
                setError(regErr.message || 'কিছু ভুল হয়েছে।');
              }
            }
          } else if (err.code === 'auth/wrong-password') {
            setError('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
          } else if (err.code === 'auth/too-many-requests') {
            setError('অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
          } else {
            setError(err.message || 'কিছু ভুল হয়েছে।');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'কিছু ভুল হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e'];
  const strengthLabels = ['', 'দুর্বল', 'মোটামুটি', 'শক্তিশালী'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          font-family: 'Outfit', sans-serif;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.06),
                      0 20px 40px -8px rgba(37, 99, 235, 0.10);
          border: 1px solid rgba(37, 99, 235, 0.08);
        }

        /* Back link */
        .auth-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 28px;
          transition: color 0.2s;
        }
        .auth-back:hover { color: #2563eb; }

        /* Logo */
        .auth-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .auth-logo-row img {
          height: 32px;
          width: auto;
          border-radius: 8px;
          object-fit: contain;
        }

        /* Steps */
        .auth-steps {
          display: flex;
          gap: 5px;
          margin-bottom: 24px;
        }
        .auth-step {
          height: 3px;
          flex: 1;
          border-radius: 100px;
          background: #e2e8f0;
          transition: background 0.35s;
        }
        .auth-step.active { background: #2563eb; }

        /* Title */
        .auth-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.4px;
          margin-bottom: 4px;
        }
        .auth-subtitle {
          font-size: 13.5px;
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        /* Info box */
        .auth-info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 20px;
          display: flex;
          gap: 9px;
          align-items: flex-start;
        }
        .auth-info-icon {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .auth-info-text {
          font-size: 12.5px;
          color: #3b82f6;
          line-height: 1.6;
        }

        /* Field */
        .auth-field { margin-bottom: 14px; }
        .auth-field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 7px;
        }
        .auth-field-input-wrap { position: relative; }

        .auth-input {
          width: 100%;
          height: 46px;
          border-radius: 11px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          padding: 0 44px 0 14px;
          font-size: 14.5px;
          font-family: 'Outfit', sans-serif;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
        }
        .auth-input::placeholder { color: #cbd5e1; }

        .auth-input-icon {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
        }
        .auth-input-icon:hover { color: #2563eb; }

        /* Password strength */
        .pw-strength {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 7px;
        }
        .pw-bars { display: flex; gap: 3px; flex: 1; }
        .pw-bar {
          height: 3px;
          flex: 1;
          border-radius: 100px;
          background: #e2e8f0;
          transition: background 0.3s;
        }
        .pw-label { font-size: 11px; font-weight: 600; }

        /* Forgot */
        .auth-forgot {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          padding: 0;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s;
        }
        .auth-forgot:hover { color: #2563eb; }

        /* Alert */
        .auth-alert {
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .auth-alert.error {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
        }
        .auth-alert.success {
          background: #f0fff4;
          border: 1px solid #c6f6d5;
          color: #276749;
        }

        /* CTA Button */
        .auth-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: #2563eb;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          margin-top: 6px;
          letter-spacing: 0.1px;
        }
        .auth-btn:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }
        .auth-btn:active:not(:disabled) { transform: scale(0.99); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .auth-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Back to login */
        .auth-back-login { text-align: center; margin-top: 18px; }
        .auth-back-login button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s;
        }
        .auth-back-login button:hover { color: #2563eb; }

        /* Footer note */
        .auth-footer-note {
          text-align: center;
          font-size: 11.5px;
          color: #cbd5e1;
          margin-top: 22px;
          line-height: 1.7;
        }
        .auth-footer-note a {
          color: #94a3b8;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .auth-footer-note a:hover { color: #2563eb; }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">

          <Link to="/" className="auth-back">
            <ArrowLeft size={13} /> হোমে ফিরুন
          </Link>

          <div className="auth-logo-row">
            <img
              src="/icon.png"
              alt={settings.appName}
              onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
            />
          </div>

          {!isReset && (
            <div className="auth-steps">
              <div className="auth-step active" />
              <div className={`auth-step ${form.email ? 'active' : ''}`} />
              <div className={`auth-step ${form.email && form.password.length >= 6 ? 'active' : ''}`} />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isReset ? 'reset' : 'auth'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="auth-title">
                {isReset ? 'পাসওয়ার্ড রিসেট' : 'স্বাগতম 👋'}
              </h2>
              <p className="auth-subtitle">
                {isReset
                  ? 'ইমেইল দিন — রিসেট লিংক পাঠানো হবে।'
                  : 'ইমেইল ও পাসওয়ার্ড দিন। নতুন হলে অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।'}
              </p>

              {!isReset && (
                <div className="auth-info-box">
                  <div className="auth-info-icon">i</div>
                  <div className="auth-info-text">
                    আগে অ্যাকাউন্ট থাকলে লগইন হবে, না থাকলে নতুন অ্যাকাউন্ট তৈরি হবে।
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <div className="auth-field-label"><span>ইমেইল</span></div>
                  <div className="auth-field-input-wrap">
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {!isReset && (
                  <div className="auth-field">
                    <div className="auth-field-label">
                      <span>পাসওয়ার্ড</span>
                      <button type="button" className="auth-forgot" onClick={() => setIsReset(true)}>
                        ভুলে গেছেন?
                      </button>
                    </div>
                    <div className="auth-field-input-wrap">
                      <input
                        className="auth-input"
                        type={showPass ? 'text' : 'password'}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        minLength={6}
                        required
                        autoComplete="current-password"
                        style={{ paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        className="auth-input-icon"
                        onClick={() => setShowPass(s => !s)}
                        tabIndex={-1}
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {form.password.length > 0 && (
                      <motion.div
                        className="pw-strength"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="pw-bars">
                          {[1, 2, 3].map(n => (
                            <div
                              key={n}
                              className="pw-bar"
                              style={{ background: n <= passwordStrength ? strengthColors[passwordStrength] : '#e2e8f0' }}
                            />
                          ))}
                        </div>
                        <span className="pw-label" style={{ color: strengthColors[passwordStrength] }}>
                          {strengthLabels[passwordStrength]}
                        </span>
                      </motion.div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      className="auth-alert error"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span>⚠️</span> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      key="success"
                      className="auth-alert success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? (
                    <><div className="auth-spinner" /> অপেক্ষা করুন...</>
                  ) : isReset ? (
                    'রিসেট লিংক পাঠান →'
                  ) : (
                    'প্রবেশ করুন →'
                  )}
                </button>
              </form>

              {isReset && (
                <div className="auth-back-login">
                  <button onClick={() => { setIsReset(false); setError(''); setSuccess(''); }}>
                    ← লগইনে ফিরে যান
                  </button>
                </div>
              )}

              <p className="auth-footer-note">
                Continue করলে আপনি আমাদের{' '}
                <Link to="/privacy-policy">Privacy Policy</Link> ও{' '}
                <Link to="/terms">Terms & Conditions</Link> মেনে নিচ্ছেন।
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}
