import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface MapRightClickHandlerProps {
  onRightClick: (lat: number, lng: number) => void
}

export default function MapRightClickHandler({ onRightClick }: MapRightClickHandlerProps) {
  const map = useMap()

  useEffect(() => {
    const handleContextMenu = (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault()
      const { lat, lng } = e.latlng
      onRightClick(lat, lng)
    }

    map.on('contextmenu', handleContextMenu)

    return () => {
      map.off('contextmenu', handleContextMenu)
    }
  }, [map, onRightClick])

  return null
}

