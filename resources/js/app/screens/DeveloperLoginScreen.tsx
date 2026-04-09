import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { postPublic } from '@/util/api';

interface DeveloperLoginScreenProps {
  onVerified: () => void;
}

/* ── tiny SVG icons (no lucide dependency for these specific ones) ── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-1 1" /><path d="m13.5 9.5 3 3" /><path d="m15 6 1 1" />
    <path d="M2 22l9.5-9.5M17 7l-1.5-1.5L17 4l3 3-1.5 1.5Z" /><circle cx="8" cy="17" r="3" />
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconEye = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

/* ── animated scan-line bar ── */
function ScanBar() {
  return (
    <motion.div
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.6), transparent)',
        pointerEvents: 'none',
      }}
      animate={{ top: ['8%', '92%', '8%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ── floating particle dots ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 5 + Math.random() * 90,
  y: 5 + Math.random() * 90,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 5,
  dur: 4 + Math.random() * 6,
}));

export const DeveloperLoginScreen: React.FC<DeveloperLoginScreenProps> = ({ onVerified }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);

  /* periodic glitch effect on the logo text */
  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Enter both fields');
    try {
      setLoading(true);
      const res = await postPublic('/api/dev/verify', { username, password });
      if (res.status) {
        sessionStorage.setItem('dev_auth_verified', 'true');
        toast.success('Access granted');
        onVerified();
        window.location.href = '/auth';
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#07060e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── ambient orbs ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '55vw', height: '55vw', maxWidth: 420,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '55vw', height: '55vw', maxWidth: 420,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── particles ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.id % 3 === 0 ? 'rgba(139,92,246,0.5)' : p.id % 3 === 1 ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.2)',
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          position: 'relative', zIndex: 10,
        }}
      >
        <div style={{
          background: 'rgba(15,13,25,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 28,
          padding: 'clamp(2rem, 6vw, 3rem) clamp(1.5rem, 5vw, 2.5rem)',
          backdropFilter: 'blur(24px)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.8), transparent)',
          }} />

          {/* scan bar animation */}
          <ScanBar />

          {/* corner marks */}
          {[
            { top: 12, left: 12, borderTop: '1px solid rgba(139,92,246,0.4)', borderLeft: '1px solid rgba(139,92,246,0.4)' },
            { top: 12, right: 12, borderTop: '1px solid rgba(139,92,246,0.4)', borderRight: '1px solid rgba(139,92,246,0.4)' },
            { bottom: 12, left: 12, borderBottom: '1px solid rgba(236,72,153,0.4)', borderLeft: '1px solid rgba(236,72,153,0.4)' },
            { bottom: 12, right: 12, borderBottom: '1px solid rgba(236,72,153,0.4)', borderRight: '1px solid rgba(236,72,153,0.4)' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderRadius: 2, ...s }} />
          ))}

          {/* ── header ── */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* hexagonal icon */}
            <motion.div
              style={{
                width: 72, height: 72, margin: '0 auto 1.25rem',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <polygon
                  points="36,4 64,19 64,53 36,68 8,53 8,19"
                  stroke="url(#hexGrad)" strokeWidth="1.5" fill="rgba(139,92,246,0.08)"
                />
                <defs>
                  <linearGradient id="hexGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              {/* static inner icon */}
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', color: '#a78bfa', fontSize: 22 }}
              >
                ⬡
              </motion.div>
            </motion.div>

            {/* glitch title */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
              <h1 style={{
                fontSize: 'clamp(1.4rem, 5vw, 1.75rem)',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: glitch ? '#ec4899' : '#e2d9f3',
                margin: 0,
                transition: 'color 0.05s',
                textShadow: glitch
                  ? '-2px 0 rgba(139,92,246,0.8), 2px 0 rgba(236,72,153,0.8)'
                  : '0 0 24px rgba(139,92,246,0.3)',
              }}>
                DEV ACCESS
              </h1>
              {/* underline bar */}
              <div style={{
                height: 2, marginTop: 6,
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                borderRadius: 2,
              }} />
            </div>

            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0.75rem 0 0',
            }}>
              Restricted environment · Authenticate to proceed
            </p>
          </div>

          {/* ── form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* username */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(139,92,246,0.7)', pointerEvents: 'none', zIndex: 1,
              }}>
                <IconUser />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 44, paddingRight: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 14,
                  color: '#e2d9f3',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  letterSpacing: '0.03em',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* password */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(236,72,153,0.7)', pointerEvents: 'none', zIndex: 1,
              }}>
                <IconKey />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 44, paddingRight: 46,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 14,
                  color: '#e2d9f3',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  letterSpacing: '0.03em',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(236,72,153,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 4,
                  }}
                >
                  <IconEye open={showPw} />
                </button>
              )}
            </div>

            {/* submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', height: 54,
                marginTop: '0.5rem',
                background: loading
                  ? 'rgba(139,92,246,0.3)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)',
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: loading ? 'none' : '0 8px 32px rgba(139,92,246,0.35)',
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={20} />
                </motion.div>
              ) : (
                <>
                  <span>Verify Identity</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          {/* ── footer ── */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(139,92,246,0.7)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <IconShield />
              <span>Encrypted</span>
            </div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              v1.0.5-dev
            </div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            {/* pulsing status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <motion.div
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399' }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Online
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};