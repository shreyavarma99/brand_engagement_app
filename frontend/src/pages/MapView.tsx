import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GamifiedMap from '../components/GamifiedMap'
import { Bounty } from '../data/mockBounties'
import BountyDashboard from '../components/BountyDashboard'
import { loadBounties, addBounty } from '../utils/bountyStorage'
import { authStore } from '../store/authStore'
import AuthModal from '../components/AuthModal'
import ProfileDropdown from '../components/ProfileDropdown'

export default function MapView() {
  const navigate = useNavigate()
  const [mapStyle, setMapStyle] = useState<'normal' | 'pixel'>('pixel')
  const [taskFilter, setTaskFilter] = useState<string>('all')
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [focusBountyId, setFocusBountyId] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authKey, setAuthKey] = useState(0) // Force re-render on auth change

  // Load bounties from localStorage on mount
  useEffect(() => {
    const loaded = loadBounties()
    setBounties(loaded)
  }, [])

  // Update bounties status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = loadBounties()
      setBounties(updated)
    }, 1000) // Update every second for countdown

    return () => clearInterval(interval)
  }, [])

  const handleBountyClick = (bounty: Bounty) => {
    navigate(`/bounty/${bounty.id}`)
  }

  const handleCreateBounty = (newBounty: Omit<Bounty, 'id' | 'companyId'>) => {
    const bounty: Bounty = {
      ...newBounty,
      id: `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId: 'new',
      startTime: newBounty.startTime || new Date().toISOString(),
      endTime: newBounty.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    const updated = addBounty(bounty)
    setBounties(updated)
    // Auto-focus on the newly created bounty
    if (bounty.location) {
      setFocusBountyId(bounty.id)
      setTimeout(() => setFocusBountyId(null), 2000) // Clear focus after animation
    }
  }

  const handleFocusBounty = (bounty: Bounty) => {
    setFocusBountyId(bounty.id)
    setTimeout(() => setFocusBountyId(null), 2000) // Clear focus after animation
  }

  const filteredBounties = taskFilter === 'all' 
    ? bounties 
    : bounties.filter(b => b.taskType === taskFilter)

  return (
    <div className="min-h-screen bg-hacker-bg">
      <nav className="bg-hacker-surface border-b border-hacker-border px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-hacker-primary font-mono">BountyMap</h1>
        <div className="flex gap-3 items-center">
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="hacker-select text-sm"
          >
            <option value="all">[all]</option>
            <option value="follow">follow</option>
            <option value="like">like</option>
            <option value="share">share</option>
            <option value="comment">comment</option>
            <option value="visit_location">visit_location</option>
            <option value="custom">custom</option>
          </select>
          <button
            onClick={() => setMapStyle(mapStyle === 'pixel' ? 'normal' : 'pixel')}
            className="hacker-button-secondary text-sm"
          >
            {mapStyle === 'pixel' ? 'normal' : 'pixel'}
          </button>
          {authStore.isAuthenticated ? (
            <ProfileDropdown key={authKey} />
          ) : (
            <button
              key={authKey}
              onClick={() => setShowAuthModal(true)}
              className="hacker-button-primary text-sm"
            >
              signup
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Force re-render to update auth state
          setAuthKey(prev => prev + 1)
        }}
      />

      <div className="flex h-[calc(100vh-48px)]">
        {/* Map Side - 60% */}
        <div className="w-[60%] relative">
          <GamifiedMap
            bounties={filteredBounties}
            onBountyClick={handleBountyClick}
            mapStyle={mapStyle}
            focusBountyId={focusBountyId}
          />
          
          {/* Stats overlay */}
          <div className="absolute top-3 left-3 bg-hacker-surface/95 border border-hacker-border p-3 z-[1000] font-mono">
            <div className="text-xs text-hacker-text-dim mb-1">active_bounties</div>
            <div className="text-xl text-hacker-accent font-semibold">{filteredBounties.length}</div>
          </div>
        </div>

        {/* Dashboard Side - 40% */}
        <div className="w-[40%] bg-hacker-surface border-l border-hacker-border overflow-y-auto">
          <BountyDashboard 
            bounties={bounties}
            onCreateBounty={handleCreateBounty}
            onBountyClick={handleBountyClick}
            onFocusBounty={handleFocusBounty}
          />
        </div>
      </div>
    </div>
  )
}
