import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GamifiedMap from '../components/GamifiedMap'
import { mockBounties, Bounty } from '../data/mockBounties'
import BountyDashboard from '../components/BountyDashboard'

export default function MapView() {
  const navigate = useNavigate()
  const [mapStyle, setMapStyle] = useState<'normal' | 'pixel'>('pixel')
  const [taskFilter, setTaskFilter] = useState<string>('all')
  const [bounties, setBounties] = useState<Bounty[]>(mockBounties)

  const handleBountyClick = (bounty: Bounty) => {
    navigate(`/bounty/${bounty.id}`)
  }

  const handleCreateBounty = (newBounty: Omit<Bounty, 'id' | 'companyId'>) => {
    const bounty: Bounty = {
      ...newBounty,
      id: Date.now().toString(),
      companyId: 'new',
    }
    setBounties([...bounties, bounty])
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
        </div>
      </nav>

      <div className="flex h-[calc(100vh-48px)]">
        {/* Map Side - 60% */}
        <div className="w-[60%] relative">
          <GamifiedMap
            bounties={filteredBounties}
            onBountyClick={handleBountyClick}
            mapStyle={mapStyle}
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
          />
        </div>
      </div>
    </div>
  )
}
