import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MapView from './pages/MapView'
import BountyDetail from './pages/BountyDetail'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/bounty/:id" element={<BountyDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default App


