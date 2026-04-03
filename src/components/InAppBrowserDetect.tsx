import { useState, useEffect } from 'react';

export default function InAppBrowserDetect() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isInApp = /FBAN|FBAV|Instagram|Messenger|WhatsApp|Line|Snapchat|GSA/i.test(ua);
    setShow(isInApp);
    setTimeout(() => setMounted(true), 50);
  }, []);

  if (!show) return null;

  const openExternal = () => {
    const url = window.location.href;
    window.open(
      `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`,
      '_blank'
    );
    setTimeout(() => { window.location.href = url; }, 500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700&display=swap');

        .iab-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #f0f4ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'DM Sans', sans-serif;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .iab-overlay.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .iab-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 360px;
          width: 100%;
          text-align: center;
          box-shadow:
            0 0 0 1px rgba(59, 130, 246, 0.08),
            0 24px 48px rgba(59, 130, 246, 0.12),
            0 4px 12px rgba(59, 130, 246, 0.06);
          position: relative;
          overflow: hidden;
        }

        .iab-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);
          border-radius: 24px 24px 0 0;
        }

        .iab-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.75rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .iab-icon-wrap svg {
          color: #3b82f6;
        }

        .iab-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e3a5f;
          margin: 0 0 0.75rem;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .iab-desc {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 2rem;
          line-height: 1.65;
          font-weight: 300;
        }

        .iab-btn-primary {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          letter-spacing: -0.01em;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .iab-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.45);
        }

        .iab-btn-primary:active {
          transform: translateY(0);
        }

        .iab-btn-skip {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8125rem;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          transition: color 0.2s;
          font-weight: 400;
        }

        .iab-btn-skip:hover {
          color: #64748b;
        }

        .iab-dots {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 120px;
          height: 120px;
          opacity: 0.04;
          background-image: radial-gradient(#3b82f6 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          pointer-events: none;
        }
      `}</style>

      <div className={`iab-overlay ${mounted ? 'visible' : ''}`}>
        <div className="iab-card">
          <div className="iab-dots" />

          <div className="iab-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>

          <h2 className="iab-title">Chrome-এ খুলুন</h2>
          <p className="iab-desc">
            সেরা অভিজ্ঞতার জন্য এক্সটার্নাল ব্রাউজার ব্যবহার করুন।
          </p>

          <button className="iab-btn-primary" onClick={openExternal}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Open in Browser
          </button>

          <button className="iab-btn-skip" onClick={() => setShow(false)}>
            এখানেই চালিয়ে যান
          </button>
        </div>
      </div>
    </>
  );
}
