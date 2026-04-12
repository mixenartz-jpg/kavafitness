import { motion } from 'framer-motion'
import { Zap, Flame, ArrowRight } from 'lucide-react'

/* ── Subtle gradient orbs — no canvas, no spinning, just smooth CSS ── */
function GradientOrbs() {
  return (
    <>
      {/* Top-left soft accent */}
      <motion.div
        style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,255,71,0.08) 0%, transparent 70%)',
          top: '-200px', left: '-200px', pointerEvents: 'none', zIndex: 0,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom-right warm accent */}
      <motion.div
        style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,140,50,0.05) 0%, transparent 70%)',
          bottom: '-180px', right: '-160px', pointerEvents: 'none', zIndex: 0,
        }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Center top subtle glow */}
      <motion.div
        style={{
          position: 'absolute', width: 900, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(232,255,71,0.04) 0%, transparent 70%)',
          top: '-80px', left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none', zIndex: 0,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </>
  )
}

/* ── Dot grid background ── */
function DotGrid() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 100%)',
    }} />
  )
}

/* ── Main Hero ── */
export function HeroGeometric({ badge = 'KavaFit Pro', onLoginClick }) {
  const fadeUp = (i) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.9, delay: 0.2 + i * 0.18, ease: [0.25, 0.4, 0.25, 1] },
    },
  })

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #070707 0%, #0c0c0c 50%, #080808 100%)',
    }}>

      <DotGrid />
      <GradientOrbs />

      {/* Thin top border accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,255,71,0.3), transparent)',
        zIndex: 10,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 20,
        padding: '80px 24px', textAlign: 'center',
        maxWidth: 860, margin: '0 auto',
      }}>

        {/* Badge */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 18px', borderRadius: 999, marginBottom: 44,
            background: 'rgba(232,255,71,0.05)',
            border: '1px solid rgba(232,255,71,0.15)',
            backdropFilter: 'blur(10px)',
          }}>
          <Zap size={12} style={{ color: '#e8ff47' }} />
          <span style={{
            fontSize: 11, fontFamily: 'Space Mono, monospace',
            color: 'rgba(232,255,71,0.85)', letterSpacing: 3,
          }}>
            {badge.toUpperCase()}
          </span>
        </motion.div>

        {/* H1 */}
        <motion.div variants={fadeUp(1)} initial="hidden" animate="visible">
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', lineHeight: 0.88, margin: '0 0 28px' }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(68px, 11vw, 130px)',
              letterSpacing: '-1px',
              color: '#fff',
            }}>
              EVRİMİNİ
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(68px, 11vw, 130px)',
              letterSpacing: '-1px',
              background: 'linear-gradient(90deg, #e8ff47 0%, #d4eb00 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 28px rgba(232,255,71,0.35))',
            }}>
              SEN YÖNET
            </span>
          </h1>
        </motion.div>

        {/* Sub-text */}
        <motion.p variants={fadeUp(2)} initial="hidden" animate="visible"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: 500, margin: '0 auto 52px',
            lineHeight: 1.75, fontWeight: 300,
          }}>
          Yapay zeka destekli antrenman koçluğu, yemek tanıma ve gelişim takibi — her şey tek platformda.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeUp(3)} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(232,255,71,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoginClick}
            style={{
              padding: '15px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#e8ff47',
              color: '#0a0a0a', fontFamily: 'Bebas Neue, sans-serif', fontSize: 19, letterSpacing: 3,
              boxShadow: '0 0 24px rgba(232,255,71,0.2)',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'box-shadow 0.3s',
            }}>
            <Flame size={18} /> HEMEN BAŞLA <ArrowRight size={16} />
          </motion.button>

          <motion.button
            whileHover={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '15px 32px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.25s',
            }}>
            Özellikleri keşfet ↓
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp(4)} initial="hidden" animate="visible"
          style={{
            marginTop: 72, paddingTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap',
          }}>
          {[
            { val: '10K+', lbl: 'KULLANICI' },
            { val: 'AI',   lbl: 'KOÇ DESTEĞİ' },
            { val: '∞',    lbl: 'ANTRENMAN'   },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '0 48px',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 40,
                color: '#e8ff47', letterSpacing: 1,
              }}>
                {s.val}
              </div>
              <div style={{
                fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3,
                color: 'rgba(255,255,255,0.3)', marginTop: 6,
              }}>
                {s.lbl}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade to dark */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
        background: 'linear-gradient(to top, #050505, transparent)',
        pointerEvents: 'none', zIndex: 5,
      }} />
    </div>
  )
}
