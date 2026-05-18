import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'imgora — HEIF to JPG converter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #13102a 0%, #1e1535 60%, #2a1a3e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              background: '#ea580c',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            i
          </div>
          <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>imgora.in</span>
        </div>

        <div style={{ color: '#ea580c', fontSize: '20px', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          HEIF → JPG
        </div>

        <div style={{ color: 'white', fontSize: '56px', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px' }}>
          iPhone photos,{'\n'}share-ready in one click.
        </div>

        <div style={{ color: '#a78bfa', fontSize: '22px' }}>
          Pre-optimised for Instagram · WhatsApp · Twitter · and more
        </div>

        <div style={{ display: 'flex', gap: '24px', marginTop: '48px' }}>
          {['100% Private', 'Free & Unlimited', 'No Signup'].map(t => (
            <div
              key={t}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                padding: '10px 24px',
                color: 'white',
                fontSize: '18px',
              }}
            >
              ✓ {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
