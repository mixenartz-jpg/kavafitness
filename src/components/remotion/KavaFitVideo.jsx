import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";

export const KavaFitVideo = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const rotation  = interpolate(frame, [0, durationInFrames], [0, 360]);
  const rotation2 = interpolate(frame, [0, durationInFrames], [360, 0]);
  const breathe   = Math.sin((frame / fps) * 0.7) * 0.06 + 1;
  const pulse1    = (Math.sin((frame / fps) * 1.1) + 1) / 2;
  const pulse2    = (Math.cos((frame / fps) * 0.75) + 1) / 2;

  return (
    <div
      style={{
        width, height,
        position: 'relative',
        overflow: 'hidden',
        background: '#000', // Remotion requires opaque bg; Landing.jsx dims it with opacity
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer slow-spinning conic ring */}
      <div style={{
        position: 'absolute',
        width: 1200, height: 1200,
        borderRadius: '50%',
        background: `conic-gradient(from ${rotation}deg,
          rgba(232,255,71,0.7)   0deg,
          rgba(180,220,0,0.15)  80deg,
          transparent           130deg,
          rgba(255,200,50,0.35) 220deg,
          rgba(232,255,71,0.1)  300deg,
          rgba(232,255,71,0.7)  360deg)`,
        filter: 'blur(70px)',
        transform: `scale(${breathe})`,
      }} />

      {/* Inner counter-rotating conic ring */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        borderRadius: '50%',
        background: `conic-gradient(from ${rotation2}deg,
          transparent              0deg,
          rgba(232,255,71,0.5)    60deg,
          transparent             120deg,
          rgba(255,160,50,0.35)   200deg,
          transparent             280deg,
          rgba(232,255,71,0.25)   340deg,
          transparent             360deg)`,
        filter: 'blur(40px)',
        opacity: 0.4 + pulse1 * 0.4,
      }} />

      {/* Center radial burst */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,255,71,0.6) 0%, rgba(232,255,71,0.15) 50%, transparent 75%)',
        filter: 'blur(24px)',
        transform: `scale(${breathe * 1.1})`,
        opacity: 0.3 + pulse2 * 0.35,
      }} />

      {/* Brand text */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 220,
        letterSpacing: 12,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(232,255,71,0.85) 60%, rgba(255,255,255,0.6) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 0 ${18 + breathe * 12}px rgba(232,255,71,0.9))`,
        transform: `scale(${breathe})`,
        userSelect: 'none',
      }}>
        KAVAFIT
      </div>
    </div>
  );
};
