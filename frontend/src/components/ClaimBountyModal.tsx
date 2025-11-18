import { useState, useRef } from 'react'
import { Bounty } from '../data/mockBounties'
import { authStore } from '../store/authStore'
import { loadBounties, saveBounties } from '../utils/bountyStorage'
import { verifyWithFakeAI, VerificationResult } from '../utils/fakeAIVerification'
import AIVerificationLoader from './AIVerificationLoader'
import AIVerificationResult from './AIVerificationResult'

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
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showLoader, setShowLoader] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !bounty) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setUploadedFile(file)
    setProofValue(URL.createObjectURL(file))
    setVerificationResult(null)
    setError('')

    // Auto-verify screenshot with fake AI
    if (proofType === 'screenshot') {
      setIsVerifying(true)
      setShowLoader(true)
      
      // Run verification in background (it's fast, but loader will take time)
      verifyWithFakeAI(file, bounty).then(result => {
        // Store result, but wait for loader to complete
        setVerificationResult(result)
      })
    }
  }

  const handleVerificationComplete = () => {
    setShowLoader(false)
    setIsVerifying(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    // For screenshots, verify if not already verified
    let finalStatus: 'pending' | 'approved' | 'rejected' = 'pending'
    let verification: VerificationResult | null = verificationResult

    if (proofType === 'screenshot' && uploadedFile && !verificationResult) {
      setIsVerifying(true)
      setShowLoader(true)
      verification = await verifyWithFakeAI(uploadedFile, bounty)
      setVerificationResult(verification)
      setShowLoader(false)
      setIsVerifying(false)
      finalStatus = verification.approved ? 'approved' : 'rejected'
    } else if (verificationResult) {
      finalStatus = verificationResult.approved ? 'approved' : 'rejected'
    }

    // Convert file to data URL if it's a file upload
    let proofValueToSave = proofValue.trim()
    if (uploadedFile && proofType === 'screenshot') {
      // Store as data URL for persistence
      proofValueToSave = proofValue
    }

    // Save proof submission
    const submission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: authStore.user!.id,
      bountyId: bounty.id,
      proofType,
      proofValue: proofValueToSave,
      status: finalStatus,
      verificationResult: verification || null,
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
    setUploadedFile(null)
    setVerificationResult(null)
    setShowLoader(false)
    setIsVerifying(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

        {showLoader && (
          <AIVerificationLoader onComplete={handleVerificationComplete} />
        )}

        {verificationResult && !showLoader && (
          <AIVerificationResult result={verificationResult} />
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
              {proofType === 'screenshot' ? 'screenshot:' : proofType === 'link' ? 'proof_link:' : 'proof_text:'}
            </label>
            {proofType === 'screenshot' ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hacker-input w-full text-sm"
                  required={!proofValue}
                />
                {proofValue && (
                  <div className="relative">
                    <img
                      src={proofValue}
                      alt="Uploaded proof"
                      className="max-w-full h-32 object-contain border border-hacker-border bg-hacker-bg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProofValue('')
                        setUploadedFile(null)
                        setVerificationResult(null)
                        setShowLoader(false)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-hacker-danger text-white text-xs rounded hover:bg-hacker-danger/80"
                    >
                      ×
                    </button>
                  </div>
                )}
                <p className="text-xs text-hacker-text-dim">
                  Upload a screenshot for AI verification
                </p>
              </div>
            ) : proofType === 'text' ? (
              <textarea
                value={proofValue}
                onChange={(e) => setProofValue(e.target.value)}
                className="hacker-input w-full h-24 text-sm"
                required
                placeholder="Describe how you completed the task..."
              />
            ) : (
              <input
                type="url"
                value={proofValue}
                onChange={(e) => setProofValue(e.target.value)}
                className="hacker-input w-full text-sm"
                required
                placeholder="https://..."
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
              disabled={isVerifying || showLoader}
            >
              {isVerifying || showLoader ? 'verifying...' : 'submit()'}
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

