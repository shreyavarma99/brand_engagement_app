import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Bounty } from '../data/mockBounties'
import { loadBounties } from '../utils/bountyStorage'
import { authStore } from '../store/authStore'
import BountyCountdown from '../components/BountyCountdown'

export default function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bounty, setBounty] = useState<Bounty | undefined>(undefined)

  useEffect(() => {
    const bounties = loadBounties()
    const found = bounties.find(b => b.id === id)
    setBounty(found)
    
    // Update bounty periodically for countdown
    const interval = setInterval(() => {
      const updated = loadBounties()
      const updatedBounty = updated.find(b => b.id === id)
      setBounty(updatedBounty)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [id])

  const handleCompleteBounty = () => {
    if (!authStore.isAuthenticated || !bounty) return
    
    if (authStore.user && !authStore.user.completedBounties.includes(bounty.id)) {
      authStore.completeBounty(bounty.id)
      // Force re-render
      setBounty({ ...bounty })
    }
  }

  const isCompleted = authStore.user?.completedBounties.includes(bounty?.id || '') || false

  if (!bounty) {
    return (
      <div className="min-h-screen bg-hacker-bg flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-lg font-semibold mb-4 text-hacker-danger">// bounty not found</h1>
          <button
            onClick={() => navigate('/')}
            className="hacker-button-primary"
          >
            back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hacker-bg p-6 font-mono">
      <button
        onClick={() => navigate('/')}
        className="mb-6 hacker-button-secondary text-sm"
      >
        ← back
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="hacker-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold mb-2 text-hacker-text">{bounty.title}</h1>
              <p className="text-sm text-hacker-text-dim">by {bounty.company.name}</p>
            </div>
            {bounty.company.logo && (
              <img src={bounty.company.logo} alt={bounty.company.name} className="w-12 h-12 border border-hacker-border" />
            )}
          </div>

          <p className="text-sm mb-6 text-hacker-text">{bounty.description}</p>

          <div className="mb-6 p-4 bg-hacker-bg border border-hacker-border">
            <BountyCountdown
              endTime={bounty.endTime}
              maxWinners={bounty.maxWinners}
              currentCount={bounty.currentCompletedCount}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            <div className="bg-hacker-bg border border-hacker-border p-3">
              <p className="text-xs text-hacker-text-dim mb-1">task_type</p>
              <p className="text-sm font-semibold text-hacker-text font-mono">{bounty.taskType.replace('_', '_')}</p>
            </div>
            <div className="bg-hacker-bg border border-hacker-border p-3">
              <p className="text-xs text-hacker-text-dim mb-1">reward</p>
              <p className="text-sm font-semibold text-hacker-accent font-mono">{bounty.rewardDetails}</p>
            </div>
            <div className="bg-hacker-bg border border-hacker-border p-3">
              <p className="text-xs text-hacker-text-dim mb-1">progress</p>
              <p className="text-sm font-semibold text-hacker-text font-mono">
                {bounty.currentCompletedCount} / {bounty.maxWinners}
              </p>
            </div>
            <div className="bg-hacker-bg border border-hacker-border p-3">
              <p className="text-xs text-hacker-text-dim mb-1">status</p>
              <p className={`text-sm font-semibold font-mono ${
                bounty.status === 'active' ? 'text-hacker-accent' : 'text-hacker-text-dim'
              }`}>
                {bounty.status}
              </p>
            </div>
          </div>

          {bounty.location && (
            <div className="mb-6">
              <p className="text-xs text-hacker-text-dim mb-2">location</p>
              <p className="text-sm text-hacker-text font-mono">
                [{bounty.location.lat.toFixed(4)}, {bounty.location.lng.toFixed(4)}]
              </p>
            </div>
          )}

          {authStore.isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-hacker-border">
              {isCompleted ? (
                <div className="bg-hacker-accent/20 border border-hacker-accent p-3 text-center">
                  <p className="text-sm text-hacker-accent font-mono">✓ bounty completed</p>
                </div>
              ) : (
                <button
                  onClick={handleCompleteBounty}
                  className="hacker-button-primary w-full text-sm"
                >
                  mark_complete()
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

