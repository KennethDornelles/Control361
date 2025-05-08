import L from 'leaflet'
import type React from 'react'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { IVehicle } from '../../types/vehicle.types'
import { VehicleStatus } from '../../types/vehicle.types'

interface MapProps {
  vehicles: IVehicle[]
  center?: { lat: number; lng: number }
  zoom?: number
  onVehicleClick?: (vehicle: IVehicle) => void
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '6px',
  overflow: 'hidden',
}

const statusColors = {
  [VehicleStatus.ATIVO]: '#00875F',
  [VehicleStatus.INATIVO]: '#F75A68',
  [VehicleStatus.MANUTENCAO]: '#FBA94C',
  [VehicleStatus.PARADO]: '#81D8F7',
  [VehicleStatus.MOVIMENTO]: '#00875F',
}

export const Map: React.FC<MapProps> = ({
  vehicles,
  center = { lat: -15.7801, lng: -47.9292 },
  zoom = 5,
  onVehicleClick,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([center.lat, center.lng], zoom)

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map)

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center.lat, center.lng, zoom])

  useEffect(() => {
    if (!mapRef.current) return

    mapRef.current.setView([center.lat, center.lng], zoom)
  }, [center.lat, center.lng, zoom])

  useEffect(() => {
    if (!mapRef.current || !vehicles) return

    const currentVehicleIds = new Set<string>()

    vehicles.forEach(vehicle => {
      const vehicleId = vehicle.id.toString()
      currentVehicleIds.add(vehicleId)

      const vehicleIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
                    background-color: ${statusColors[vehicle.status]}; 
                    width: 12px; 
                    height: 12px; 
                    border-radius: 50%; 
                    border: 2px solid white;
                    box-shadow: 0 0 4px rgba(0,0,0,0.6);
                "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      if (markersRef.current[vehicleId]) {
        markersRef.current[vehicleId].setLatLng([
          vehicle.latitude,
          vehicle.longitude,
        ])
        markersRef.current[vehicleId].setIcon(vehicleIcon)
      } else {
        if (mapRef.current) {
          const marker = L.marker([vehicle.latitude, vehicle.longitude], {
            icon: vehicleIcon,
          })
            .addTo(mapRef.current)
            .on('click', () => handleMarkerClick(vehicle))

          marker.bindTooltip(
            `
                        <div style="background-color: #1A1A1D; color: #E1E1E6; padding: 8px; border-radius: 4px; border: 1px solid #29292E;">
                            <strong style="font-size: 14px;">${vehicle.placa}</strong>
                            <div style="font-size: 12px; color: #C4C4CC; margin-top: 2px;">${vehicle.modelo}</div>
                        </div>
                    `,
            {
              direction: 'top',
              offset: [0, -10],
              opacity: 0.9,
              className: 'dark-tooltip',
            }
          )

          markersRef.current[vehicleId] = marker
        }
      }
    })

    Object.keys(markersRef.current).forEach(id => {
      if (!currentVehicleIds.has(id) && mapRef.current) {
        mapRef.current.removeLayer(markersRef.current[id])
        delete markersRef.current[id]
      }
    })
  }, [vehicles])

  const handleMarkerClick = (vehicle: IVehicle) => {
    if (onVehicleClick) {
      onVehicleClick(vehicle)
    }

    if (mapRef.current && vehicle) {
      const marker = markersRef.current[vehicle.id.toString()]
      if (marker) {
        marker.unbindPopup()

        const popupContent = `
                    <div style="min-width: 220px; background-color: #1A1A1D; color: #E1E1E6; padding: 12px; border-radius: 6px; border: 1px solid #29292E;">
                        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px; border-bottom: 1px solid #29292E; padding-bottom: 8px;">${vehicle.placa}</div>
                        <div style="margin: 6px 0;"><span style="color: #C4C4CC; font-size: 13px;">Modelo:</span> <span style="font-size: 14px;">${vehicle.modelo}</span></div>
                        <div style="margin: 6px 0;"><span style="color: #C4C4CC; font-size: 13px;">Status:</span> 
                            <span style="
                                font-size: 13px; 
                                padding: 2px 8px; 
                                border-radius: 50px; 
                                background-color: ${statusColors[vehicle.status]}; 
                                color: ${['MANUTENÇÃO', 'PARADO'].includes(vehicle.status) ? '#121214' : 'white'};
                                font-weight: 500;
                                display: inline-block;
                                margin-left: 4px;
                            ">${vehicle.status}</span>
                        </div>
                        <div style="margin: 6px 0;"><span style="color: #C4C4CC; font-size: 13px;">Velocidade:</span> <span style="font-size: 14px;">${vehicle.velocidade} km/h</span></div>
                        ${vehicle.motorista ? `<div style="margin: 6px 0;"><span style="color: #C4C4CC; font-size: 13px;">Motorista:</span> <span style="font-size: 14px;">${vehicle.motorista}</span></div>` : ''}
                    </div>
                `

        marker
          .bindPopup(popupContent, {
            className: 'dark-popup',
            closeButton: true,
            closeOnEscapeKey: true,
          })
          .openPopup()
      }
    }
  }

  useEffect(() => {
    if (!document.getElementById('dark-map-styles')) {
      const styleEl = document.createElement('style')
      styleEl.id = 'dark-map-styles'
      styleEl.textContent = `
                .dark-tooltip .leaflet-tooltip-content {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .dark-tooltip.leaflet-tooltip {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .dark-popup .leaflet-popup-content-wrapper {
                    background-color: transparent !important;
                    color: white !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .dark-popup .leaflet-popup-content {
                    margin: 0 !important;
                }
                .dark-popup .leaflet-popup-tip-container {
                    display: none !important;
                }
                .dark-popup .leaflet-popup-close-button {
                    color: white !important;
                    z-index: 1;
                    font-size: 16px;
                    width: 20px;
                    height: 20px;
                    right: 8px;
                    top: 8px;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    margin-bottom: 20px !important;
                    margin-right: 20px !important;
                }
                .leaflet-control-zoom a {
                    background-color: #1A1A1D !important;
                    color: #E1E1E6 !important;
                    border: 1px solid #29292E !important;
                    width: 30px !important;
                    height: 30px !important;
                    line-height: 30px !important;
                    font-size: 16px !important;
                    font-weight: bold !important;
                }
                .leaflet-control-zoom a:hover {
                    background-color: #29292E !important;
                }
                .leaflet-control-attribution {
                    background-color: rgba(26, 26, 29, 0.8) !important;
                    color: #7C7C8A !important;
                }
                .leaflet-control-attribution a {
                    color: #8257E5 !important;
                }
            `
      document.head.appendChild(styleEl)
    }
  }, [])

  if (!L) {
    return (
      <div
        className="bg-[#1A1A1D] border border-[#29292E] rounded-md p-4"
        style={{ height: '400px' }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-[#F75A68] bg-opacity-10 border border-[#F75A68] text-[#E1E1E6] p-4 rounded-md mb-4 max-w-lg">
            <h3 className="font-bold mb-2">Não foi possível carregar o mapa</h3>
            <p>Houve um problema ao carregar a biblioteca do Leaflet.</p>
          </div>

          {vehicles && vehicles.length > 0 ? (
            <div className="bg-[#1A1A1D] p-4 rounded-md border border-[#29292E] shadow-sm w-full max-w-lg">
              <h3 className="font-bold mb-2 text-[#E1E1E6]">
                Visualização Alternativa de Veículos
              </h3>
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-[#29292E]">
                  <thead className="bg-[#121214]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                        Placa
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                        Modelo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1A1A1D] divide-y divide-[#29292E]">
                    {vehicles.map(vehicle => (
                      <tr
                        key={vehicle.id}
                        onClick={() => handleMarkerClick(vehicle)}
                        className="hover:bg-[#29292E] cursor-pointer"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-[#E1E1E6]">
                          {vehicle.placa}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-[#E1E1E6]">
                          {vehicle.modelo}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${
                                                          vehicle.status ===
                                                          'EM MOVIMENTO'
                                                            ? 'bg-[#00875F] text-white'
                                                            : vehicle.status ===
                                                                'MANUTENÇÃO'
                                                              ? 'bg-[#FBA94C] text-[#121214]'
                                                              : vehicle.status ===
                                                                  'INATIVO'
                                                                ? 'bg-[#F75A68] text-white'
                                                                : 'bg-[#81D8F7] text-[#121214]'
                                                        }`}
                          >
                            {vehicle.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-[#7C7C8A] italic">
              Nenhum veículo encontrado para exibir.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      className="map-container border border-[#29292E] rounded-md"
      style={containerStyle}
    />
  )
}
