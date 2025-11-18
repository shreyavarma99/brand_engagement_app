import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Bounty } from '../data/mockBounties'
import MapZoomControl from './MapZoomControl'
import MapRightClickHandler from './MapRightClickHandler'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Component to handle map focusing
function MapFocus({ bountyId, bounties }: { bountyId: string | null | undefined; bounties: Bounty[] }) {
  const map = useMap()

  useEffect(() => {
    if (!bountyId) return

    const bounty = bounties.find(b => b.id === bountyId)
    if (bounty && bounty.location) {
      const { lat, lng } = bounty.location
      map.flyTo([lat, lng], 12, {
        duration: 1.5,
      })
    }
  }, [bountyId, bounties, map])

  return null
}

interface GamifiedMapProps {
  bounties: Bounty[]
  onBountyClick: (bounty: Bounty) => void
  mapStyle?: 'normal' | 'pixel'
  focusBountyId?: string | null
  searchLocation?: { lat: number; lng: number } | null
  onMapRightClick?: (lat: number, lng: number) => void
}

// Custom marker component with emoji icons
function BountyMarker({ bounty, onClick }: { bounty: Bounty; onClick: () => void }) {
  const markerRef = useRef<L.Marker>(null)

  if (!bounty.location) return null

  const { lat, lng } = bounty.location

  // Create custom icon with emoji
  const emojiIcon = L.divIcon({
    className: 'bounty-marker',
    html: `<div style="
      font-size: 32px;
      text-align: center;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      cursor: pointer;
      transition: transform 0.2s;
    ">${getMarkerIcon(bounty.taskType)}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })

  return (
    <Marker
      position={[lat, lng]}
      icon={emojiIcon}
      ref={markerRef}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup maxWidth={300} className="bounty-popup">
        <div style={{ 
          minWidth: '250px', 
          color: '#c9d1d9',
          backgroundColor: '#161b22',
          fontFamily: 'JetBrains Mono, monospace',
          padding: '12px',
          border: '1px solid #30363d'
        }}>
          <h3 style={{ 
            fontWeight: '600', 
            marginBottom: '8px',
            fontSize: '14px',
            color: '#58a6ff'
          }}>
            {bounty.title}
          </h3>
          <p style={{ 
            fontSize: '11px', 
            color: '#8b949e', 
            marginBottom: '8px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            by {bounty.company.name}
          </p>
          <p style={{ 
            fontSize: '11px', 
            marginBottom: '10px',
            color: '#c9d1d9',
            lineHeight: '1.4'
          }}>
            {bounty.description}
          </p>
          
          <div style={{ 
            borderTop: '1px solid #30363d',
            paddingTop: '8px',
            marginTop: '8px'
          }}>
            <div style={{ 
              marginBottom: '8px',
              fontSize: '10px',
              color: '#8b949e'
            }}>
              {(() => {
                const end = new Date(bounty.endTime).getTime()
                const now = new Date().getTime()
                const diff = end - now
                const isFull = bounty.currentCompletedCount >= bounty.maxWinners
                
                if (isFull) {
                  return <span style={{ color: '#f85149' }}>limit_reached</span>
                }
                if (diff <= 0) {
                  return <span style={{ color: '#f85149' }}>expired</span>
                }
                
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                const format = (n: number) => String(n).padStart(2, '0')
                
                return (
                  <span>
                    time_left: <span style={{ color: '#3fb950' }}>
                      {days > 0 && `${days}d `}
                      {format(hours)}:{format(minutes)}:{format(seconds)}
                    </span>
                  </span>
                )
              })()}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '11px'
            }}>
              <span style={{ color: '#8b949e' }}>task_type:</span>
              <span style={{ color: '#c9d1d9', fontFamily: 'monospace' }}>{bounty.taskType}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '11px'
            }}>
              <span style={{ color: '#8b949e' }}>reward:</span>
              <span style={{ color: '#3fb950', fontFamily: 'monospace', fontWeight: '600' }}>
                {bounty.rewardDetails}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '11px'
            }}>
              <span style={{ color: '#8b949e' }}>progress:</span>
              <span style={{ color: '#c9d1d9', fontFamily: 'monospace' }}>
                {bounty.currentCompletedCount}/{bounty.maxWinners}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '11px'
            }}>
              <span style={{ color: '#8b949e' }}>status:</span>
              <span style={{ 
                color: bounty.status === 'active' ? '#3fb950' : '#8b949e',
                fontFamily: 'monospace'
              }}>
                {bounty.status}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onClick()}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '6px 12px',
              backgroundColor: '#58a6ff',
              color: '#0d1117',
              border: '1px solid #58a6ff',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#79c0ff'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#58a6ff'
            }}
          >
            view_details()
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

// Component to apply pixel art filter
function MapStyle({ mapStyle }: { mapStyle: 'normal' | 'pixel' }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    if (mapStyle === 'pixel') {
      container.style.filter = 'contrast(1.2) saturate(1.3)'
    } else {
      container.style.filter = 'none'
    }
  }, [map, mapStyle])

  return null
}

export default function GamifiedMap({ bounties, onBountyClick, mapStyle = 'pixel', focusBountyId, searchLocation, onMapRightClick }: GamifiedMapProps) {
  // Calculate center from bounties or use default (center of USA)
  const bountiesWithLocation = bounties.filter(b => b.location)
  const center: [number, number] = bountiesWithLocation.length > 0
    ? [
        bountiesWithLocation.reduce((sum, b) => sum + b.location!.lat, 0) / bountiesWithLocation.length,
        bountiesWithLocation.reduce((sum, b) => sum + b.location!.lng, 0) / bountiesWithLocation.length,
      ]
    : [39.8283, -98.5795] // Center of USA

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={bountiesWithLocation.length > 0 ? 5 : 4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapStyle mapStyle={mapStyle} />
        <MapFocus bountyId={focusBountyId} bounties={bounties} />
        <MapZoomControl targetLocation={searchLocation || null} />
        {onMapRightClick && <MapRightClickHandler onRightClick={onMapRightClick} />}
        {bountiesWithLocation.map((bounty) => (
          <BountyMarker
            key={bounty.id}
            bounty={bounty}
            onClick={() => onBountyClick(bounty)}
          />
        ))}
      </MapContainer>
      <style>{`
        .bounty-marker:hover {
          transform: scale(1.2) !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: #161b22 !important;
          border: 1px solid #30363d !important;
        }
        .bounty-popup .leaflet-popup-close-button {
          color: #8b949e !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
        .bounty-popup .leaflet-popup-close-button:hover {
          color: #c9d1d9 !important;
        }
      `}</style>
    </div>
  )
}

function getMarkerIcon(taskType: string): string {
  const icons: Record<string, string> = {
    follow: '👥',
    like: '👍',
    share: '📤',
    comment: '💬',
    visit_location: '📍',
    custom: '🎯',
  }
  return icons[taskType] || '🎁'
}
