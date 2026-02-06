import { useState } from 'react'

function Host() {
  const [gameCode] = useState('ABC123')

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🎮 Host View</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Game Code: {gameCode}</h2>
        <p>This is the main host/beamer view for the MVP.</p>
        <p style={{ marginTop: '1rem', color: '#888' }}>
          Players can join using the game code above.
        </p>
      </div>
    </div>
  )
}

export default Host
