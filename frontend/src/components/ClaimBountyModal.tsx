import { useState } from 'react'
import { Bounty } from '../data/mockBounties'
import { authStore } from '../store/authStore'
import { loadBounties, saveBounties } from '../utils/bountyStorage'

interface ClaimBountyModalProps {
  isOpen: boolean
  onClose: () => void
  bounty: Bounty | null
  onSuccess: () => void
}

export default function ClaimBountyModal({ isOpen, onClose, bounty, onSuccess }: ClaimBountyModalProps) {
  const [proofType, setProofType] = useState<'screenshot' | 'link' | 'text'>('screenshot')
  const [proofValue, setProofValue] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !bounty) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!proofValue.trim()) {
      setError('Please provide proof')
      return
    }

    if (!authStore.isAuthenticated) {
      setError('Please sign up first')
      return
    }

    // Check if already claimed
    const submissions = loadSubmissions()
    const existing = submissions.find(
      (s: any) => s.userId === authStore.user!.id && s.bountyId === bounty.id
    )
    if (existing) {
      setError('You have already claimed this bounty')
      return
    }

    // Save proof submission
    const submission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: authStore.user!.id,
      bountyId: bounty.id,
      proofType,
      proofValue: proofValue.trim(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }
    submissions.push(submission)
    saveSubmissions(submissions)

    // Mark bounty as completed for user
    if (authStore.user && !authStore.user.completedBounties.includes(bounty.id)) {
      authStore.completeBounty(bounty.id)
    }

    // Update bounty completion count
    const bounties = loadBounties()
    const bountyIndex = bounties.findIndex(b => b.id === bounty.id)
    if (bountyIndex !== -1) {
      bounties[bountyIndex].currentCompletedCount += 1
      saveBounties(bounties)
    }

    onSuccess()
    onClose()
    setProofValue('')
    setProofType('screenshot')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-mono">
      <div className="bg-hacker-surface border border-hacker-border p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-hacker-primary">claim_bounty()</h2>
          <button
            onClick={onClose}
            className="text-hacker-text-dim hover:text-hacker-text"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-hacker-bg border border-hacker-border">
          <h3 className="text-sm font-semibold text-hacker-text mb-1">{bounty.title}</h3>
          <p className="text-xs text-hacker-text-dim">{bounty.company.name}</p>
          <p className="text-xs text-hacker-accent mt-2">Reward: {bounty.rewardDetails}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-hacker-danger/20 border border-hacker-danger text-hacker-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-hacker-text-dim mb-1">proof_type:</label>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value as any)}
              className="hacker-select w-full text-sm"
            >
              <option value="screenshot">screenshot</option>
              <option value="link">link</option>
              <option value="text">text</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-hacker-text-dim mb-1">
              {proofType === 'screenshot' ? 'image_url:' : proofType === 'link' ? 'proof_link:' : 'proof_text:'}
            </label>
            {proofType === 'text' ? (
              <textarea
                value={proofValue}
                onChange={(e) => setProofValue(e.target.value)}
                className="hacker-input w-full h-24 text-sm"
                required
                placeholder="Describe how you completed the task..."
              />
            ) : (
              <input
                type={proofType === 'link' ? 'url' : 'text'}
                value={proofValue}
                onChange={(e) => setProofValue(e.target.value)}
                className="hacker-input w-full text-sm"
                required
                placeholder={proofType === 'screenshot' ? 'https://...' : 'https://...'}
              />
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="hacker-button-secondary flex-1 text-sm"
            >
              cancel
            </button>
            <button
              type="submit"
              className="hacker-button-primary flex-1 text-sm"
            >
              submit()
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper functions for submissions storage
function loadSubmissions(): any[] {
  try {
    const stored = localStorage.getItem('bountymap_submissions')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading submissions:', error)
  }
  return []
}

function saveSubmissions(submissions: any[]) {
  try {
    localStorage.setItem('bountymap_submissions', JSON.stringify(submissions))
  } catch (error) {
    console.error('Error saving submissions:', error)
  }
}

