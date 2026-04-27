import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/hive-group.png"
        alt="Hive Group"
        style={{
          width: 'auto',
          height: 64,
          objectFit: 'contain',
          filter: 'invert(1) brightness(2)',
        }}
      />
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: 0.7,
        }}
      >
        Admin Panel
      </span>
    </div>
  )
}

export default Logo
