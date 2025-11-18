import { useNavigate, useSearchParams } from 'react-router-dom'
import { authStore } from '../store/authStore'
import { loadBounties } from '../utils/bountyStorage'
import { Bounty } from '../data/mockBounties'

// Helper to load submissions
function loadSubmissions() {
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

export default function Profile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'profile'
  const { user } = authStore

  if (!user) {
    return (
      <div className="min-h-screen bg-hacker-bg flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-lg font-semibold mb-4 text-hacker-danger">// not authenticated</h1>
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

  const allBounties = loadBounties()
  const completedBounties = allBounties.filter(b => user.completedBounties.includes(b.id))
  const submissions = loadSubmissions()
  const userSubmissions = submissions.filter((s: any) => s.userId === user.id)

  // Calculate total earnings (count of completed bounties)
  const totalEarnings = completedBounties.length

  return (
    <div className="min-h-screen bg-hacker-bg p-6 font-mono">
      <button
        onClick={() => navigate('/')}
        className="mb-6 hacker-button-secondary text-sm"
      >
        ← back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-hacker-border">
          <button
            onClick={() => navigate('/profile?tab=profile')}
            className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${
              tab === 'profile' 
                ? 'border-hacker-primary text-hacker-primary' 
                : 'border-transparent text-hacker-text-dim hover:text-hacker-text'
            }`}
          >
            profile
          </button>
          <button
            onClick={() => navigate('/profile?tab=rewards')}
            className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${
              tab === 'rewards' 
                ? 'border-hacker-primary text-hacker-primary' 
                : 'border-transparent text-hacker-text-dim hover:text-hacker-text'
            }`}
          >
            rewards
          </button>
          <button
            onClick={() => navigate('/profile?tab=settings')}
            className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${
              tab === 'settings' 
                ? 'border-hacker-primary text-hacker-primary' 
                : 'border-transparent text-hacker-text-dim hover:text-hacker-text'
            }`}
          >
            settings
          </button>
        </div>

        {tab === 'profile' && (
          <>
            <div className="hacker-card mb-6">
              <h1 className="text-xl font-semibold mb-4 text-hacker-primary">profile</h1>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-hacker-text-dim">username:</span>
              <span className="text-hacker-text font-mono">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-hacker-text-dim">email:</span>
              <span className="text-hacker-text font-mono">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-hacker-text-dim">role:</span>
              <span className="text-hacker-text font-mono">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-hacker-text-dim">member_since:</span>
              <span className="text-hacker-text font-mono">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="hacker-card text-center">
                <div className="text-2xl font-semibold text-hacker-accent mb-2">
                  {completedBounties.length}
                </div>
                <div className="text-xs text-hacker-text-dim">completed_bounties</div>
              </div>
              <div className="hacker-card text-center">
                <div className="text-2xl font-semibold text-hacker-primary mb-2">
                  {totalEarnings}
                </div>
                <div className="text-xs text-hacker-text-dim">total_rewards</div>
              </div>
            </div>

            <div className="hacker-card">
              <h2 className="text-lg font-semibold mb-4 text-hacker-primary">completed_bounties:</h2>
          {completedBounties.length === 0 ? (
            <div className="text-center py-12 text-hacker-text-dim text-sm">
              <p>// no completed bounties yet</p>
              <p className="text-xs mt-2">start hunting to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedBounties.map((bounty) => {
                const submission = userSubmissions.find((s: any) => s.bountyId === bounty.id)
                return (
                  <div key={bounty.id} className="bg-hacker-bg border border-hacker-border p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm text-hacker-text">{bounty.title}</h3>
                      <span className="text-xs text-hacker-accent font-mono">✓ completed</span>
                    </div>
                    <p className="text-xs text-hacker-text-dim mb-2">{bounty.company.name}</p>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-hacker-accent font-mono">{bounty.rewardDetails}</span>
                      <span className="text-hacker-text-dim font-mono">
                        {bounty.taskType}
                      </span>
                    </div>
                    {submission && (
                      <div className="mt-2 pt-2 border-t border-hacker-border">
                        <p className="text-xs text-hacker-text-dim mb-1">proof:</p>
                        {submission.proofType === 'screenshot' && (
                          <img 
                            src={submission.proofValue} 
                            alt="Proof" 
                            className="max-w-full h-32 object-contain border border-hacker-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        {submission.proofType === 'link' && (
                          <a 
                            href={submission.proofValue} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-hacker-primary hover:underline break-all"
                          >
                            {submission.proofValue}
                          </a>
                        )}
                        {submission.proofType === 'text' && (
                          <p className="text-xs text-hacker-text">{submission.proofValue}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
            </div>
          </>
        )}

        {tab === 'rewards' && (
          <div className="hacker-card">
            <h1 className="text-xl font-semibold mb-4 text-hacker-primary">rewards</h1>
            {completedBounties.length === 0 ? (
              <div className="text-center py-12 text-hacker-text-dim text-sm">
                <p>// no rewards yet</p>
                <p className="text-xs mt-2">complete bounties to earn rewards</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedBounties.map((bounty) => (
                  <div key={bounty.id} className="bg-hacker-bg border border-hacker-border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-sm text-hacker-text">{bounty.title}</h3>
                        <p className="text-xs text-hacker-text-dim mt-1">{bounty.company.name}</p>
                      </div>
                      <span className="text-xs text-hacker-accent font-mono font-semibold">
                        {bounty.rewardDetails}
                      </span>
                    </div>
                    <p className="text-xs text-hacker-text-dim">task: {bounty.taskType}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="hacker-card">
            <h1 className="text-xl font-semibold mb-4 text-hacker-primary">settings</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-hacker-text-dim mb-2">username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="hacker-input w-full text-sm opacity-50"
                />
                <p className="text-xs text-hacker-text-dim mt-1">// username cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs text-hacker-text-dim mb-2">email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="hacker-input w-full text-sm opacity-50"
                />
                <p className="text-xs text-hacker-text-dim mt-1">// email cannot be changed</p>
              </div>
              <div className="pt-4 border-t border-hacker-border">
                <button
                  onClick={() => {
                    authStore.logout()
                    navigate('/')
                  }}
                  className="hacker-button-secondary text-sm"
                >
                  logout()
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

