import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
  const strengthColors = ['', 'bg-destructive', 'bg-yellow-500', 'bg-green-500'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> হোমে ফিরুন
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/icon.png"
              alt={settings.appName}
              className="h-10 object-contain"
              onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isReset ? 'reset' : 'auth'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-bold text-center mb-1">
                {isReset ? 'পাসওয়ার্ড রিসেট' : 'স্বাগতম'}
              </h2>
              <p className="text-xs text-muted-foreground text-center mb-5">
                {isReset ? 'ইমেইল দিন — রিসেট লিংক পাঠানো হবে।' : 'লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {!isReset && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">পাসওয়ার্ড</label>
                      <button type="button" className="text-[11px] text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsReset(true)}>
                        ভুলে গেছেন?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        minLength={6}
                        required
                        autoComplete="current-password"
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPass(s => !s)}
                        tabIndex={-1}
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {form.password.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3].map(n => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-colors ${n <= passwordStrength ? strengthColors[passwordStrength] : 'bg-border'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : isReset ? (
                    'রিসেট লিংক পাঠান'
                  ) : (
                    'প্রবেশ করুন'
                  )}
                </button>
              </form>

              {isReset && (
                <button
                  onClick={() => { setIsReset(false); setError(''); setSuccess(''); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-3"
                >
                  ← লগইনে ফিরে যান
                </button>
              )}

              <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
                Continue করলে আপনি আমাদের{' '}
                <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-primary">Privacy Policy</Link> ও{' '}
                <Link to="/terms" className="underline underline-offset-2 hover:text-primary">Terms</Link> মেনে নিচ্ছেন।
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
