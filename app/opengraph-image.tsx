import { ImageResponse } from 'next/og';

export const alt =
  'Seaway Sites — your website already exists. Personalized first drafts for Canadian small businesses; most eligible requests are delivered within the hour during service hours.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Social card in the night-studio identity: ink canvas, blueprint
// hairlines, phosphor-lume accent. Pure JSX — no font or image fetches.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#0a0c0f',
          color: '#efeae0',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Satori supports one background image per node, so each grid axis
            is rendered on its own full-size layer. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(to right, rgba(239,234,224,0.06) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(to bottom, rgba(239,234,224,0.06) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: '#cdf463' }} />
          <div style={{ fontSize: 30, letterSpacing: 6, color: 'rgba(239,234,224,0.65)' }}>
            SEAWAY SITES
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, lineHeight: 1.02, fontWeight: 600 }}>
            Your website
          </div>
          <div style={{ fontSize: 92, lineHeight: 1.02, fontWeight: 600 }}>
            already exists.
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 34,
              fontStyle: 'italic',
              color: 'rgba(239,234,224,0.62)',
            }}
          >
            We just haven&apos;t shown it to you yet.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              padding: '12px 26px',
              borderRadius: 9999,
              background: '#cdf463',
              color: '#0c0f08',
              fontSize: 24,
              fontWeight: 700,
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Most eligible drafts within the hour
          </div>
          <div style={{ fontSize: 23, color: 'rgba(239,234,224,0.55)', fontFamily: 'Arial, sans-serif' }}>
            During service hours · no credit card
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
