import React from 'react'

export const Icon: React.FC = () => {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo/hive-group.png"
      alt="Hive Group"
      style={{
        width: 32,
        height: 'auto',
        objectFit: 'contain',
      }}
    />
  )
}

export default Icon
