import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(45deg, #1e40af, #dc2626, #1e40af)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid #fbbf24',
          position: 'relative',
        }}
      >
        {/* Símbolo de karate */}
        <div
          style={{
            fontSize: '20px',
            color: 'white',
            fontWeight: '900',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🥋
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}