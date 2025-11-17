import { Bounty } from '../data/mockBounties'
import { mockBounties } from '../data/mockBounties'

const STORAGE_KEY = 'bountymap_bounties'

export function loadBounties(): Bounty[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with mock bounties (in case new ones were added)
      const mockIds = new Set(mockBounties.map(b => b.id))
      const customBounties = parsed.filter((b: Bounty) => !mockIds.has(b.id))
      return [...mockBounties, ...customBounties]
    }
  } catch (error) {
    console.error('Error loading bounties:', error)
  }
  return mockBounties
}

export function saveBounties(bounties: Bounty[]) {
  try {
    // Only save custom bounties (not mock ones)
    const mockIds = new Set(mockBounties.map(b => b.id))
    const customBounties = bounties.filter(b => !mockIds.has(b.id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customBounties))
  } catch (error) {
    console.error('Error saving bounties:', error)
  }
}

export function addBounty(bounty: Bounty) {
  const bounties = loadBounties()
  const updated = [...bounties, bounty]
  saveBounties(updated)
  return updated
}

export function updateBounty(id: string, updates: Partial<Bounty>) {
  const bounties = loadBounties()
  const updated = bounties.map(b => 
    b.id === id ? { ...b, ...updates } : b
  )
  saveBounties(updated)
  return updated
}

export function deleteBounty(id: string) {
  const bounties = loadBounties()
  const mockIds = new Set(mockBounties.map(b => b.id))
  // Don't allow deleting mock bounties
  if (mockIds.has(id)) {
    return bounties
  }
  const updated = bounties.filter(b => b.id !== id)
  saveBounties(updated)
  return updated
}

