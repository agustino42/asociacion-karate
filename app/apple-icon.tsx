import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '20%',
          border: '8px solid #fbbf24',
          position: 'relative',
        }}
      >
        {/* Símbolo de karate más grande */}
        <div
          style={{
            fontSize: '100px',
            color: 'white',
            fontWeight: '900',
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🥋
        </div>
        
        {/* Texto AK en la parte inferior */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            fontSize: '24px',
            color: '#fbbf24',
            fontWeight: '900',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '2px',
          }}
        >
          AK
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}