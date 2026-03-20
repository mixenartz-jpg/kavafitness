// ── KavaFit SVG İkon Kütüphanesi ──
// Kullanım: <Icon name="home" size={22} color="var(--accent)" />

const ICONS = {
  home: (
    <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  dumbbell: (
    <>
      <path d="M6 5h2v14H6zM16 5h2v14h-2z" />
      <rect x="2" y="8" width="4" height="8" rx="1"/>
      <rect x="18" y="8" width="4" height="8" rx="1"/>
      <path d="M8 12h8" strokeLinecap="round"/>
    </>
  ),
  apple: (
    <path d="M12 2c-1.5 0-3 1-3 2.5 0 0 1.5 0 3 0s3 0 3 0C15 3 13.5 2 12 2zM7 6c-2.5 1-4 3.5-4 6a9 9 0 0018 0c0-2.5-1.5-5-4-6-1 0-2 .5-3 .5S8 6 7 6z" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="7"  x2="20" y2="7"  strokeLinecap="round"/>
      <line x1="4" y1="12" x2="16" y2="12" strokeLinecap="round"/>
      <line x1="4" y1="17" x2="12" y2="17" strokeLinecap="round"/>
    </>
  ),
  body: (
    <>
      <circle cx="12" cy="4" r="2"/>
      <path d="M8 8h8l-1 6-2 7h-2l-2-7-1-6z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 9l-3 5M16 9l3 5" strokeLinecap="round"/>
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22" strokeLinecap="round"/>
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
    </>
  ),
  arrowLeft: (
    <>
      <line x1="20" y1="12" x2="4" y2="12" strokeLinecap="round"/>
      <polyline points="10 18 4 12 10 6" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  arrowRight: (
    <>
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round"/>
      <polyline points="14 6 20 12 14 18" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  play: (
    <polygon points="5 3 19 12 5 21 5 3" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  robot: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="2"/>
      <path d="M8 8V6a4 4 0 018 0v2"/>
      <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
      <path d="M9 17h6" strokeLinecap="round"/>
      <path d="M12 3v3" strokeLinecap="round"/>
    </>
  ),
  chart: (
    <>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/>
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-2"/>
      <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="13" y2="16" strokeLinecap="round"/>
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round"/>
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
      <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round"/>
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="7"/>
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  food: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round"/>
      <circle cx="7" cy="6" r="1" fill="currentColor"/>
      <circle cx="7" cy="12" r="1" fill="currentColor"/>
      <circle cx="7" cy="18" r="1" fill="currentColor"/>
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round"/>
      <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round"/>
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  film: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <line x1="2" y1="15" x2="22" y2="15"/>
      <line x1="7" y1="4" x2="7" y2="9"/>
      <line x1="12" y1="4" x2="12" y2="9"/>
      <line x1="17" y1="4" x2="17" y2="9"/>
      <line x1="7" y1="15" x2="7" y2="20"/>
      <line x1="12" y1="15" x2="12" y2="20"/>
      <line x1="17" y1="15" x2="17" y2="20"/>
    </>
  ),
}

export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style = {} }) {
  const paths = ICONS[name]
  if (!paths) return <span style={{ fontSize: size * 0.8, ...style }}>{name}</span>

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {paths}
    </svg>
  )
}
