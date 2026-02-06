import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Host from './pages/Host'
import Team from './pages/Team'
import Player from './pages/Player'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/host" replace />} />
        <Route path="/host" element={<Host />} />
        <Route path="/team" element={<Team />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
