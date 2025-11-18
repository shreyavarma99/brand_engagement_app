import { useState, useEffect } from 'react'

interface BountyCountdownProps {
  endTime: string
  maxWinners: number
  currentCount: number
}

export default function BountyCountdown({ endTime, maxWinners, currentCount }: BountyCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime()
      const now = new Date().getTime()
      const difference = end - now

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds, expired: false }
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  if (!timeLeft) return null

  const isFull = currentCount >= maxWinners
  const isExpired = timeLeft.expired

  if (isFull) {
    return (
      <div className="text-xs text-hacker-warning font-mono">
        <span className="text-hacker-danger">limit_reached</span>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="text-xs text-hacker-text-dim font-mono">
        <span className="text-hacker-danger">expired</span>
      </div>
    )
  }

  const formatTime = (value: number) => String(value).padStart(2, '0')

  return (
    <div className="text-xs font-mono">
      <div className="text-hacker-text-dim mb-1">
        time_left: <span className="text-hacker-accent">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </span>
      </div>
      <div className="text-hacker-text-dim">
        completed: <span className="text-hacker-primary">{currentCount}</span> / <span className="text-hacker-text-dim">{maxWinners}</span>
      </div>
    </div>
  )
}

