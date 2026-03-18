import { getXpLevel } from '../context/AppContext'

// ── Pixel-art karakter renk paletleri — seviyeye göre ──
const PALETTES = [
  // Level 1-2: Cılız başlangıç, gri kıyafet
  { skin:'#f4a56a', hair:'#4a3728', shirt:'#666', pants:'#444', shoes:'#333', belt:null,     medal:null,     glow:null },
  // Level 3-4: Biraz kaslı, mavi tişört
  { skin:'#f4a56a', hair:'#4a3728', shirt:'#4a90d9', pants:'#2c3e50', shoes:'#333', belt:null, medal:null, glow:null },
  // Level 5-6: Daha kaslı, kırmızı gym kıyafeti + kemer
  { skin:'#e8935a', hair:'#3a2a1e', shirt:'#c0392b', pants:'#1a252f', shoes:'#222', belt:'#e8c547', medal:null, glow:'rgba(232,200,71,.15)' },
  // Level 7-8: Max kas, altın kıyafet + madalya + ışıltı
  { skin:'#d4844a', hair:'#2a1a0e', shirt:'#e8c547', pants:'#0a0a1a', shoes:'#111', belt:'#fff',    medal:'#e8c547', glow:'rgba(232,200,71,.3)' },
]

function getPaletteForLevel(level) {
  if (level <= 2) return PALETTES[0]
  if (level <= 4) return PALETTES[1]
  if (level <= 6) return PALETTES[2]
  return PALETTES[3]
}

// ── SVG pixel blok çizici yardımcıları ──
function Px({ x, y, w=1, h=1, c }) {
  const SIZE = 6  // her pixel birimi
  return <rect x={x*SIZE} y={y*SIZE} width={w*SIZE} height={h*SIZE} fill={c} />
}

function PixelCharacter({ level, animate = false }) {
  const p = getPaletteForLevel(level)
  const isStrong = level >= 5
  const isElite  = level >= 7

  return (
    <svg
      viewBox="0 0 120 180"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering:'pixelated', width:'100%', height:'100%' }}
    >
      {/* Arka plan ışıltısı (yüksek level) */}
      {p.glow && (
        <circle cx="60" cy="90" r="55" fill={p.glow} />
      )}

      {/* ── SAÇLAR ── */}
      <Px x={7} y={2} w={6} h={1} c={p.hair}/>
      <Px x={6} y={3} w={8} h={1} c={p.hair}/>

      {/* ── BAŞ ── */}
      <Px x={7} y={4} w={6} h={5} c={p.skin}/>
      {/* Gözler */}
      <Px x={8}  y={6} c="#1a1a1a"/>
      <Px x={11} y={6} c="#1a1a1a"/>
      {/* Ağız */}
      <Px x={9}  y={8} w={2} h={1} c={isElite ? '#e8c547' : '#c07050'}/>

      {/* ── BOYUN ── */}
      <Px x={9} y={9} w={2} h={1} c={p.skin}/>

      {/* ── GÖVDE (TİŞÖRT) ── */}
      {isStrong ? (
        // Kaslı vücut — daha geniş omuzlar
        <>
          <Px x={5}  y={10} w={10} h={1} c={p.shirt}/>  {/* geniş omuz */}
          <Px x={6}  y={11} w={8}  h={6} c={p.shirt}/>
          {/* Kas detayları */}
          <Px x={7}  y={12} w={2}  h={2} c={p.shirt === '#e8c547' ? '#d4a820' : '#ffffff22'}/>
          <Px x={11} y={12} w={2}  h={2} c={p.shirt === '#e8c547' ? '#d4a820' : '#ffffff22'}/>
        </>
      ) : (
        // Normal vücut
        <>
          <Px x={6}  y={10} w={8}  h={1} c={p.shirt}/>
          <Px x={7}  y={11} w={6}  h={6} c={p.shirt}/>
        </>
      )}

      {/* ── KEMER (level 5+) ── */}
      {p.belt && (
        <Px x={6} y={17} w={8} h={1} c={p.belt}/>
      )}

      {/* ── KOLLAR ── */}
      {isStrong ? (
        // Kaslı kollar
        <>
          {/* Sol kol */}
          <Px x={3}  y={10} w={3} h={2} c={p.skin}/>
          <Px x={3}  y={12} w={3} h={3} c={p.skin}/>
          <Px x={3}  y={15} w={2} h={2} c={p.skin}/>
          {/* Sağ kol */}
          <Px x={14} y={10} w={3} h={2} c={p.skin}/>
          <Px x={14} y={12} w={3} h={3} c={p.skin}/>
          <Px x={15} y={15} w={2} h={2} c={p.skin}/>
        </>
      ) : (
        // Normal kollar
        <>
          <Px x={4}  y={10} w={2} h={6} c={p.skin}/>
          <Px x={14} y={10} w={2} h={6} c={p.skin}/>
        </>
      )}

      {/* ── DAMBIL (level 3+) ── */}
      {level >= 3 && (
        <>
          {/* Sol dambıl */}
          <Px x={1} y={14} w={2} h={1} c="#888"/>
          <Px x={0} y={13} w={1} h={3} c="#666"/>
          <Px x={3} y={13} w={1} h={3} c="#666"/>
          {/* Sağ dambıl */}
          <Px x={17} y={14} w={2} h={1} c="#888"/>
          <Px x={16} y={13} w={1} h={3} c="#666"/>
          <Px x={19} y={13} w={1} h={3} c="#666"/>
        </>
      )}

      {/* ── PANTOLON ── */}
      <Px x={6} y={18} w={8} h={5} c={p.pants}/>
      {/* Paça ayrımı */}
      <Px x={9} y={20} w={2} h={3} c={`${p.pants}aa`}/>

      {/* ── AYAKLAR ── */}
      <Px x={6}  y={23} w={3} h={3} c={p.pants}/>
      <Px x={11} y={23} w={3} h={3} c={p.pants}/>
      {/* Ayakkabılar */}
      <Px x={5}  y={26} w={4} h={2} c={p.shoes}/>
      <Px x={11} y={26} w={4} h={2} c={p.shoes}/>

      {/* ── MADALYA (level 7+) ── */}
      {p.medal && (
        <>
          <Px x={9} y={14} w={2} h={1} c="#aaa"/>  {/* ip */}
          <Px x={9} y={15} w={2} h={2} c={p.medal}/> {/* madalya */}
          <Px x={9} y={15} c="#fff"/> {/* parıltı */}
        </>
      )}

      {/* ── LEVEL BADGE ── */}
      <rect x="76" y="0" width="44" height="20" rx="6" fill="rgba(0,0,0,.6)"/>
      <text x="98" y="14" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill="#e8ff47">
        LV{level}
      </text>

      {/* ── ANİMASYON (bounce) ── */}
      {animate && (
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 0,-3; 0,0" dur="1.5s" repeatCount="indefinite"
        />
      )}
    </svg>
  )
}

// ── Dışa aktarılan ana bileşen ──
export default function PixelAvatar({ totalXP, size = 120, animate = false, showLevel = true }) {
  const xpData  = getXpLevel(totalXP || 0)
  const level   = xpData.level

  return (
    <div style={{ position:'relative', width:size, height:size * 1.5, flexShrink:0 }}>
      {/* Arka plan dairesi */}
      <div style={{
        position:'absolute', inset:0,
        background:'radial-gradient(circle, rgba(232,255,71,.06) 0%, transparent 70%)',
        borderRadius:'50%',
      }}/>
      <PixelCharacter level={level} animate={animate} />
    </div>
  )
}

// ── Küçük avatar (header/profile chip) ──
export function PixelAvatarMini({ totalXP, size = 36 }) {
  const level = getXpLevel(totalXP || 0).level
  const p     = getPaletteForLevel(level)
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', overflow:'hidden',
      background:'var(--surface2)', border:'1px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
    }}>
      <svg viewBox="20 20 80 100" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering:'pixelated', width:'100%', height:'100%' }}>
        {/* Sadece baş kısmı */}
        <rect x="42" y="24" width="36" height="6" fill={p.hair}/>
        <rect x="42" y="30" width="36" height="30" fill={p.skin}/>
        <rect x="48" y="36" width="6" height="6" fill="#1a1a1a"/>
        <rect x="66" y="36" width="6" height="6" fill="#1a1a1a"/>
        <rect x="54" y="48" width="12" height="6" fill={p.shirt === '#e8c547' ? '#e8c547' : '#c07050'}/>
      </svg>
    </div>
  )
}
