import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Bounty } from '../data/mockBounties'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface GamifiedMapProps {
  bounties: Bounty[]
  onBountyClick: (bounty: Bounty) => void
  mapStyle?: 'normal' | 'pixel'
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
      <Popup>
        <div style={{ minWidth: '200px', color: '#000' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{bounty.title}</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{bounty.company.name}</p>
          <p style={{ fontSize: '12px', marginBottom: '8px' }}>{bounty.description.substring(0, 60)}...</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#7ED321', marginBottom: '4px' }}>
            Reward: {bounty.rewardDetails}
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {bounty.currentCompletedCount}/{bounty.maxWinners} completed
          </p>
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

export default function GamifiedMap({ bounties, onBountyClick, mapStyle = 'pixel' }: GamifiedMapProps) {
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
          border-radius: 8px;
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
