import { Bounty } from '../data/mockBounties'

export interface VerificationStage {
  message: string
  delay: number
}

export interface VerificationResult {
  approved: boolean
  confidence: number
  reason: string
}

// Staged loading messages - optimized for ~6 seconds total
export const VERIFICATION_STAGES: VerificationStage[] = [
  { message: 'Uploading screenshot...', delay: 300 },
  { message: 'Analyzing visual structure...', delay: 400 },
  { message: 'Extracting text from image...', delay: 350 },
  { message: 'Comparing with expected proof pattern...', delay: 450 },
  { message: 'Running authenticity checks...', delay: 400 },
  { message: 'Generating confidence score...', delay: 300 },
]

// Predefined reasons for approved submissions
const APPROVED_REASONS = [
  'Brand username detected in the screenshot.',
  'Visual structure matches typical proof format.',
  'Screenshot is clear and consistent with expected post layout.',
  'Required UI elements (follow/like button) are visible.',
  'Image quality meets verification standards.',
  'Proof pattern aligns with bounty requirements.',
]

// Predefined reasons for rejected submissions
const REJECTED_REASONS = [
  'Unable to detect key elements required for proof verification.',
  'Screenshot does not match expected proof format.',
  'Image quality is insufficient for verification.',
  'Required UI elements are not clearly visible.',
  'Proof pattern does not align with bounty requirements.',
  'Brand identifier not found in screenshot.',
]

// Store image hashes to detect duplicates
const imageHashes = new Set<string>()

/**
 * Simple hash function for image data
 */
async function hashImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Extract brand name from bounty
 */
function extractBrandName(bounty: Bounty): string {
  // Try to extract from description (e.g., "@coolbrand")
  const match = bounty.description.match(/@(\w+)/i)
  if (match) {
    return match[1].toLowerCase()
  }
  // Fallback to company name
  return bounty.company.name.toLowerCase().replace(/\s+/g, '')
}

/**
 * Fake AI verification with staged messages
 * Demo mode: Only approves files with "example_screenshot_swe" in filename
 */
export async function verifyWithFakeAI(
  file: File,
  bounty: Bounty
): Promise<VerificationResult> {
  const fileName = file.name.toLowerCase()
  
  // Demo rule: Only approve if filename contains "example_screenshot_swe"
  if (fileName.includes('example_screenshot_swe')) {
    const confidence = Math.floor(Math.random() * 26) + 70 // 70-95
    const reason = APPROVED_REASONS[Math.floor(Math.random() * APPROVED_REASONS.length)]
    return {
      approved: true,
      confidence,
      reason,
    }
  }
  
  // All other screenshots are rejected
  const confidence = Math.floor(Math.random() * 31) + 20 // 20-50
  const reason = REJECTED_REASONS[Math.floor(Math.random() * REJECTED_REASONS.length)]
  return {
    approved: false,
    confidence,
    reason,
  }
}

