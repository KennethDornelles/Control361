import { useEffect, useRef } from 'react'
import type { IVehicle } from '../../types/vehicle.types'
import { VehicleStatus } from '../../types/vehicle.types'

let L: any

// Verificação da disponibilidade do Leaflet
try {
  L = require('leaflet')
  require('leaflet/dist/leaflet.css')
} catch (e) {
  console.error('Erro ao carregar Leaflet:', e)
}

interface VehicleMapProps {
  vehicles: IVehicle[]
  selectedVehicle?: IVehicle
  onVehicleClick?: (vehicle: IVehicle) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

export const VehicleMap = ({
  vehicles,
  selectedVehicle,
  onVehicleClick,
  center,
  zoom = 5,
}: VehicleMapProps) => {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const isLeafletAvailable = !!L && !(L.isAvailable === false)

  // Inicializar o mapa
  useEffect(() => {
    if (!isLeafletAvailable || !mapRef.current) return

    // Inicializar o mapa se ainda não estiver inicializado
    if (!mapInstanceRef.current) {
      const initialCenter = center || { lat: -15.7801, lng: -47.9292 }
      mapInstanceRef.current = L.map(mapRef.current).setView([initialCenter.lat, initialCenter.lng], zoom)

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(mapInstanceRef.current)

      L.control
        .zoom({
          position: 'bottomright',
        })
        .addTo(mapInstanceRef.current)
    } else if (center) {
      // Atualizar centro do mapa se a prop center mudar
      mapInstanceRef.current.setView([center.lat, center.lng], zoom)
    }

    // Limpar os marcadores existentes
    Object.values(markersRef.current).forEach((marker: any) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker)
      }
    })

    markersRef.current = {}

    // Adicionar novos marcadores para cada veículo
    vehicles.forEach(vehicle => {
      const isSelected = selectedVehicle?.id === vehicle.id
      const isActive = vehicle.status === VehicleStatus.ATIVO
      const isMoving = vehicle.status === VehicleStatus.MOVIMENTO

      // Determinar a cor do marcador baseada no status do veículo
      const getMarkerColor = () => {
        if (isSelected) return '#7C3AED' // Roxo para veículos selecionados
        if (isActive || isMoving) return '#04D361' // Verde para veículos ativos
        return '#F75A68' // Vermelho para veículos inativos
      }

      // Criar um ícone personalizado para o marcador
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div
            style="
              background-color: ${getMarkerColor()};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid #29292E;
              box-shadow: 0 0 0 2px rgba(225, 225, 230, 0.2);
            "
          ></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      // Criar um marcador na posição do veículo
      const marker = L.marker([vehicle.latitude, vehicle.longitude], {
        icon,
      }).addTo(mapInstanceRef.current)

      // Adicionar o evento de clique ao marcador
      marker.on('click', () => handleMarkerClick(vehicle))

      marker.bindTooltip(
        `
                        <div style="background-color: #1A1A1D; color: #E1E1E6; padding: 8px; border-radius: 4px; border: 1px solid #29292E;">
                            <strong style="font-size: 14px;">${vehicle.placa}</strong>
                            <p style="margin: 4px 0; font-size: 12px;">${vehicle.modelo
        }</p>
                            <p style="margin: 4px 0; font-size: 12px;">Velocidade: ${vehicle.velocidade
        } km/h</p>
                            <p style="margin: 4px 0; font-size: 12px;">Status: ${vehicle.status
        }</p>
                            <p style="margin: 4px 0; font-size: 12px;">Motorista: ${vehicle.motorista || 'Não informado'
        }</p>
                        </div>
                    `,
        {
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
          className: 'custom-tooltip',
        }
      )

      markersRef.current[vehicle.id] = marker
    })

    // Centralizar o mapa no veículo selecionado
    if (selectedVehicle && markersRef.current[selectedVehicle.id]) {
      mapInstanceRef.current.setView(
        [selectedVehicle.latitude, selectedVehicle.longitude],
        12
      )
    }
    // Limpar o mapa quando o componente é desmontado
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [vehicles, selectedVehicle, center, zoom, isLeafletAvailable])

  // Função para lidar com o clique em um marcador
  const handleMarkerClick = (vehicle: IVehicle) => {
    if (onVehicleClick) {
      onVehicleClick(vehicle)
    }
  }

  // Se Leaflet não estiver disponível, mostrar uma visualização alternativa
  if (!isLeafletAvailable) {
    return (
      <div className="p-4 border border-[#29292E] rounded-md">
        <p className="text-red-500 mb-4">Não foi possível carregar o mapa</p>
        <h3 className="text-xl font-bold mb-4">Visualização Alternativa de Veículos</h3>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#29292E]">
              <th className="py-2 text-left">Placa</th>
              <th className="py-2 text-left">Modelo</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Velocidade</th>
              <th className="py-2 text-left">Localização</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr
                key={vehicle.id}
                className={`border-b border-[#29292E] ${selectedVehicle?.id === vehicle.id ? 'bg-[#29292E]' : ''
                  }`}
                onClick={() => handleMarkerClick(vehicle)}
              >
                <td className="py-2">{vehicle.placa}</td>
                <td className="py-2">{vehicle.modelo}</td>
                <td className="py-2">{vehicle.status}</td>
                <td className="py-2">{vehicle.velocidade} km/h</td>
                <td className="py-2">
                  {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="map-container border border-[#29292E] rounded-md"
      style={{
        width: '100%',
        height: 400,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    />
  )
}
