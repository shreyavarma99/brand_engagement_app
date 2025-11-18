import { useState, useEffect } from 'react'
import { Bounty } from '../data/mockBounties'
import { authStore } from '../store/authStore'
import ClaimBountyModal from './ClaimBountyModal'
import BountyCountdown from './BountyCountdown'

interface BountyDashboardProps {
  bounties: Bounty[]
  onCreateBounty: (bounty: Omit<Bounty, 'id' | 'companyId'>) => void
  onBountyClick: (bounty: Bounty) => void
  onFocusBounty?: (bounty: Bounty) => void
}

// Helper to check if user has claimed a bounty
function hasUserClaimed(bountyId: string): boolean {
  if (!authStore.user) return false
  try {
    const stored = localStorage.getItem('bountymap_submissions')
    if (stored) {
      const submissions = JSON.parse(stored)
      return submissions.some((s: any) => s.userId === authStore.user!.id && s.bountyId === bountyId)
    }
  } catch (error) {
    console.error('Error checking submissions:', error)
  }
  return false
}

export default function BountyDashboard({ bounties, onCreateBounty, onBountyClick, onFocusBounty }: BountyDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [claimBounty, setClaimBounty] = useState<Bounty | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // Force re-render after claim
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'follow' as Bounty['taskType'],
    rewardType: 'coupon' as Bounty['rewardType'],
    rewardDetails: '',
    maxWinners: 20,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    location: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateBounty({
      title: formData.title,
      description: formData.description,
      taskType: formData.taskType,
      rewardType: formData.rewardType,
      rewardDetails: formData.rewardDetails,
      maxWinners: formData.maxWinners,
      currentCompletedCount: 0,
      status: 'active',
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location,
      company: {
        id: 'new',
        name: 'Your Company',
        logo: null,
      },
    })
    // Reset form
    setFormData({
      title: '',
      description: '',
      taskType: 'follow',
      rewardType: 'coupon',
      rewardDetails: '',
      maxWinners: 20,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      location: { lat: 40.7128, lng: -74.0060 },
    })
    setShowCreateForm(false)
    // Scroll to top to see the new bounty
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="h-full flex flex-col font-mono">
      {/* Header */}
      <div className="p-4 border-b border-hacker-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-hacker-primary">dashboard</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="hacker-button-primary text-sm"
          >
            {showCreateForm ? 'cancel' : '+ create'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-hacker-bg border border-hacker-border p-2">
            <div className="text-lg font-semibold text-hacker-accent">{bounties.length}</div>
            <div className="text-xs text-hacker-text-dim">total</div>
          </div>
          <div className="bg-hacker-bg border border-hacker-border p-2">
            <div className="text-lg font-semibold text-hacker-warning">
              {bounties.filter(b => b.status === 'active').length}
            </div>
            <div className="text-xs text-hacker-text-dim">active</div>
          </div>
          <div className="bg-hacker-bg border border-hacker-border p-2">
            <div className="text-lg font-semibold text-hacker-primary">
              {bounties.reduce((sum, b) => sum + b.currentCompletedCount, 0)}
            </div>
            <div className="text-xs text-hacker-text-dim">completed</div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-hacker-border bg-hacker-bg/50">
          <h3 className="text-sm font-semibold mb-3 text-hacker-primary">create_bounty()</h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-hacker-text-dim mb-1">title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="hacker-input w-full text-sm"
                required
                placeholder="Follow Our Instagram!"
              />
            </div>

            <div>
              <label className="block text-xs text-hacker-text-dim mb-1">description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="hacker-input w-full h-20 text-sm"
                required
                placeholder="Describe the task..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">task_type:</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value as Bounty['taskType'] })}
                  className="hacker-select w-full text-sm"
                >
                  <option value="follow">follow</option>
                  <option value="like">like</option>
                  <option value="share">share</option>
                  <option value="comment">comment</option>
                  <option value="visit_location">visit_location</option>
                  <option value="custom">custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">reward_type:</label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ ...formData, rewardType: e.target.value as Bounty['rewardType'] })}
                  className="hacker-select w-full text-sm"
                >
                  <option value="coupon">coupon</option>
                  <option value="discount">discount</option>
                  <option value="free_item">free_item</option>
                  <option value="points">points</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-hacker-text-dim mb-1">reward_details:</label>
              <input
                type="text"
                value={formData.rewardDetails}
                onChange={(e) => setFormData({ ...formData, rewardDetails: e.target.value })}
                className="hacker-input w-full text-sm"
                required
                placeholder="20% off coupon"
              />
            </div>

            <div>
              <label className="block text-xs text-hacker-text-dim mb-1">max_winners:</label>
              <input
                type="number"
                value={formData.maxWinners}
                onChange={(e) => setFormData({ ...formData, maxWinners: parseInt(e.target.value) })}
                className="hacker-input w-full text-sm"
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">start_time:</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="hacker-input w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">end_time:</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="hacker-input w-full text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">lat:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lat: parseFloat(e.target.value) }
                  })}
                  className="hacker-input w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-hacker-text-dim mb-1">lng:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.lng}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lng: parseFloat(e.target.value) }
                  })}
                  className="hacker-input w-full text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="hacker-button-primary w-full text-sm mt-4"
            >
              submit()
            </button>
          </form>
        </div>
      )}

      {/* Bounties List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold mb-3 text-hacker-text-dim">bounties:</h3>
        {bounties.length === 0 ? (
          <div className="text-center py-12 text-hacker-text-dim text-sm">
            <p>// no bounties found</p>
            <p className="text-xs mt-2">create your first one above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bounties.map((bounty) => (
              <div
                key={`${bounty.id}-${refreshKey}`}
                className="hacker-card hover:border-hacker-primary/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 
                    onClick={() => onBountyClick(bounty)}
                    className="font-semibold text-sm text-hacker-text cursor-pointer hover:text-hacker-primary"
                  >
                    {bounty.title}
                  </h4>
                  <span className={`px-2 py-0.5 border text-xs font-mono ${
                    bounty.status === 'active' ? 'border-hacker-accent text-hacker-accent' :
                    bounty.status === 'completed' ? 'border-hacker-warning text-hacker-warning' :
                    'border-hacker-text-dim text-hacker-text-dim'
                  }`}>
                    {bounty.status}
                  </span>
                </div>
                <p className="text-xs text-hacker-text-dim mb-2 line-clamp-2">{bounty.description}</p>
                <div className="mb-2">
                  <BountyCountdown
                    endTime={bounty.endTime}
                    maxWinners={bounty.maxWinners}
                    currentCount={bounty.currentCompletedCount}
                  />
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-hacker-accent font-mono">{bounty.rewardDetails}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {bounty.location && onFocusBounty && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFocusBounty(bounty)
                      }}
                      className="hacker-button-secondary flex-1 text-xs"
                    >
                      focus_on_map()
                    </button>
                  )}
                  {authStore.isAuthenticated && bounty.status === 'active' && bounty.currentCompletedCount < bounty.maxWinners && (
                    hasUserClaimed(bounty.id) ? (
                      <div className="flex-1 text-xs text-center py-2 px-3 bg-hacker-accent/20 border border-hacker-accent text-hacker-accent font-mono">
                        ✓ claimed
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setClaimBounty(bounty)
                        }}
                        className="hacker-button-primary flex-1 text-xs"
                      >
                        claim_bounty()
                      </button>
                    )
                  )}
                  {bounty.status !== 'active' && (
                    <div className="flex-1 text-xs text-center py-2 px-3 bg-hacker-text-dim/20 border border-hacker-text-dim text-hacker-text-dim font-mono">
                      {bounty.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClaimBountyModal
        isOpen={!!claimBounty}
        onClose={() => setClaimBounty(null)}
        bounty={claimBounty}
        onSuccess={() => {
          // Force re-render to update claim status
          setRefreshKey(prev => prev + 1)
        }}
      />
    </div>
  )
}

