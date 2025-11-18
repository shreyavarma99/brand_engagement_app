import { VerificationResult } from '../utils/fakeAIVerification'
import { useEffect, useState } from 'react'

interface AIVerificationResultProps {
  result: VerificationResult
}

export default function AIVerificationResult({ result }: AIVerificationResultProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [confidenceWidth, setConfidenceWidth] = useState(0)

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100)
    
    // Animate confidence bar
    setTimeout(() => {
      setConfidenceWidth(result.confidence)
    }, 300)
  }, [result.confidence])

  return (
    <div 
      className={`mb-4 p-4 border rounded transition-all duration-500 ${
        result.approved 
          ? 'bg-green-900/20 border-green-500/50' 
          : 'bg-hacker-danger/20 border-hacker-danger/50'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-mono font-semibold ${
              result.approved ? 'text-green-400' : 'text-hacker-danger'
            }`}>
              {result.approved ? '✓ Approved' : '✗ Rejected'}
            </span>
            <span className="px-2 py-0.5 bg-hacker-primary/20 border border-hacker-primary/30 rounded text-xs text-hacker-primary">
              Verified by AI
            </span>
          </div>
          
          {/* Confidence meter */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-hacker-text-dim">Confidence Score</span>
              <span className="text-xs font-mono font-semibold text-hacker-text">
                {result.confidence}%
              </span>
            </div>
            <div className="h-2 bg-hacker-bg rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  result.approved 
                    ? 'bg-gradient-to-r from-green-500 to-green-400' 
                    : 'bg-gradient-to-r from-hacker-danger to-red-500'
                }`}
                style={{ width: `${confidenceWidth}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-hacker-border/30">
        <p className="text-xs text-hacker-text-dim mb-1">Analysis Result:</p>
        <p className="text-sm text-hacker-text leading-relaxed">{result.reason}</p>
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-xs text-hacker-text-dim/60">
        <span>NovaVision-1.0 Local Engine</span>
        <span>•</span>
        <span>Local Processing</span>
      </div>
    </div>
  )
}

