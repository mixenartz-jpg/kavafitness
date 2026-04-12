import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { motion } from "framer-motion";
import { Player } from "@remotion/player";
import { KavaFitVideo } from "../remotion/KavaFitVideo";

const FEATURES = [
  {
    icon: "🤖", title: "AI Koç",
    desc: "Hedefine özel antrenman ve beslenme planları. Her sorunun cevabı tek mesajda.",
    glow: "rgba(232,255,71,0.12)"
  },
  {
    icon: "📸", title: "Yemek Tanıma",
    desc: "Fotoğraf çek — yapay zeka kalori ve makroları saniyeler içinde kaydetsin.",
    glow: "rgba(255,180,50,0.12)"
  },
  {
    icon: "📈", title: "Gelişim Takibi",
    desc: "Haftalık ve aylık verilerle kas & kilo gelişimini profesyonel grafiklerle izle.",
    glow: "rgba(100,200,255,0.10)"
  },
  {
    icon: "📋", title: "Antrenman Şablonları",
    desc: "Başarılı programları şablon olarak kaydet, tek tuşla tekrar uygula.",
    glow: "rgba(200,100,255,0.10)"
  }
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Radial glow overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        background: `radial-gradient(circle at 50% 0%, ${feature.glow} 0%, transparent 80%)`,
      }} />

      <div style={{
        position: 'relative', padding: '32px 28px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, marginBottom: 20,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
        }}>
          {feature.icon}
        </div>
        <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 1.5, color: '#fff', marginBottom: 10 }}>
          {feature.title}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function Landing({ onLoginClick }) {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff' }}>

      {/* ── Hero Section ── */}
      <div style={{ background: '#050505' }}>
        <HeroGeometric onLoginClick={onLoginClick} />
      </div>

      {/* ── Features Section ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 999, marginBottom: 20,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: 3,
            color: 'rgba(255,255,255,0.4)'
          }}>
            PRO ÖZELLİKLER
          </div>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(40px,6vw,72px)',
            letterSpacing: 2, marginBottom: 16,
            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            NEDEN{' '}
            <span style={{
              WebkitTextFillColor: '#e8ff47',
              filter: 'drop-shadow(0 0 20px rgba(232,255,71,0.5))'
            }}>
              KAVAFIT?
            </span>
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16,
            color: 'rgba(255,255,255,0.3)', maxWidth: 480, margin: '0 auto'
          }}>
            Dünyanın en vizyonlu fitness asistanı senin telefonunda.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section style={{ padding: '60px 24px 120px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 300, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(232,255,71,0.04) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(40px,6vw,72px)',
            letterSpacing: 2, marginBottom: 16, color: '#fff'
          }}>
            HAZIR MISIN?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16,
            color: 'rgba(255,255,255,0.3)', marginBottom: 48
          }}>
            Ücretsiz hesap oluştur, ilk antrenmanını bugün başlat.
          </p>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(232,255,71,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoginClick}
            style={{
              padding: '18px 56px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #e8ff47 0%, #c8df00 100%)',
              color: '#0a0a0a', fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 4,
              boxShadow: '0 0 40px rgba(232,255,71,0.3), 0 8px 32px rgba(0,0,0,0.5)'
            }}
          >
            SİSTEME GİRİŞ YAP
          </motion.button>
        </motion.div>
      </section>

    </div>
  );
}
