import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapZoomControlProps {
  targetLocation: { lat: number; lng: number } | null
}

export default function MapZoomControl({ targetLocation }: MapZoomControlProps) {
  const map = useMap()

  useEffect(() => {
    if (targetLocation) {
      map.flyTo([targetLocation.lat, targetLocation.lng], 13, {
        duration: 1.5,
      })
    }
  }, [targetLocation, map])

  return null
}

