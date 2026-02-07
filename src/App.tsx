import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Host from './pages/Host'
import HostBoard from './pages/HostBoard'
import HostMinigame from './pages/HostMinigame'
import Team from './pages/Team'
import Player from './pages/Player'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/host" replace />} />
        <Route path="/host" element={<Host />} />
        <Route path="/host/board" element={<HostBoard />} />
        <Route path="/host/minigame" element={<HostMinigame />} />
        <Route path="/team" element={<Team />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
