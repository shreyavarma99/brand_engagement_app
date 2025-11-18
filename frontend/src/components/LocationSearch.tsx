import { useState, useEffect, useRef } from 'react'

interface LocationResult {
  display_name: string
  lat: string
  lon: string
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              'User-Agent': 'BountyMap/1.0',
            },
          }
        )
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Location search error:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSelect = (location: LocationResult) => {
    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lon)
    onLocationSelect(lat, lng)
    setQuery('')
    setShowResults(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search location..."
          className="hacker-input w-full text-sm pr-8"
        />
        {isSearching && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-hacker-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!isSearching && query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-hacker-text-dim hover:text-hacker-text"
          >
            ×
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-hacker-surface border border-hacker-border rounded shadow-lg z-[2000] max-h-64 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full text-left px-3 py-2 hover:bg-hacker-bg transition-colors border-b border-hacker-border last:border-b-0"
            >
              <p className="text-sm text-hacker-text font-mono">{location.display_name}</p>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-hacker-surface border border-hacker-border rounded shadow-lg z-[2000] p-3">
          <p className="text-xs text-hacker-text-dim font-mono">No results found</p>
        </div>
      )}
    </div>
  )
}

