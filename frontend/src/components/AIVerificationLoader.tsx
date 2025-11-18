import { useState, useEffect } from 'react'
import { VERIFICATION_STAGES, VerificationStage } from '../utils/fakeAIVerification'

interface AIVerificationLoaderProps {
  onComplete: () => void
}

export default function AIVerificationLoader({ onComplete }: AIVerificationLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (currentStage >= VERIFICATION_STAGES.length) {
      // Small delay before calling onComplete to ensure smooth transition
      setTimeout(() => {
        onComplete()
      }, 200)
      return
    }

    const stage = VERIFICATION_STAGES[currentStage]
    setIsTyping(true)
    setDisplayedText('')

    // Type out the message character by character (faster for shorter total time)
    let charIndex = 0
    const typingInterval = setInterval(() => {
      if (charIndex < stage.message.length) {
        setDisplayedText(stage.message.substring(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        
        // Wait for the delay, then move to next stage
        setTimeout(() => {
          setCurrentStage(prev => prev + 1)
        }, stage.delay)
      }
    }, 20) // Typing speed: 20ms per character (faster)

    return () => clearInterval(typingInterval)
  }, [currentStage, onComplete])

  return (
    <div className="mb-4 p-4 bg-gradient-to-br from-hacker-bg via-hacker-surface to-hacker-bg border border-hacker-border rounded relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-hacker-primary/5 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          {/* Animated spinner */}
          <div className="relative">
            <div className="w-5 h-5 border-2 border-hacker-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-5 h-5 border-2 border-hacker-accent/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-hacker-text font-mono font-semibold">
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-hacker-primary ml-1 animate-pulse">|</span>}
            </p>
            <div className="mt-1 h-1 bg-hacker-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-hacker-primary to-hacker-accent animate-pulse"
                style={{ 
                  width: `${((currentStage + 1) / VERIFICATION_STAGES.length) * 100}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-hacker-text-dim">
          <span className="px-2 py-0.5 bg-hacker-primary/20 border border-hacker-primary/30 rounded">
            NovaVision-1.0 Local Engine
          </span>
          <span className="text-hacker-text-dim/60">
            Stage {currentStage + 1}/{VERIFICATION_STAGES.length}
          </span>
        </div>
      </div>
    </div>
  )
}

