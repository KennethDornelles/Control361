import { render, screen } from '@testing-library/react'
import React from 'react'
import { Map } from '../../../components/common/Map'
import type { IVehicle } from '../../../types/vehicle.types'
import { VehicleStatus, VehicleType } from '../../../types/vehicle.types'

jest.mock('leaflet', () => {
  return {
    map: jest.fn().mockReturnValue({
      setView: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      removeLayer: jest.fn(),
    }),
    tileLayer: jest.fn().mockReturnValue({
      addTo: jest.fn(),
    }),
    marker: jest.fn().mockReturnValue({
      addTo: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      bindTooltip: jest.fn().mockReturnThis(),
      setLatLng: jest.fn().mockReturnThis(),
      setIcon: jest.fn().mockReturnThis(),
      unbindPopup: jest.fn().mockReturnThis(),
      bindPopup: jest.fn().mockReturnThis(),
      openPopup: jest.fn().mockReturnThis(),
    }),
    divIcon: jest.fn().mockReturnValue({}),
    control: {
      zoom: jest.fn().mockReturnValue({
        addTo: jest.fn(),
      }),
    },
  }
})

jest.mock('leaflet/dist/leaflet.css', () => ({}))

const mockVehicles: IVehicle[] = [
  {
    id: '1',
    placa: 'ABC1234',
    modelo: 'Fiat Uno',
    tipo: VehicleType.CARRO,
    status: VehicleStatus.ATIVO,
    velocidade: 60,
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -15.8,
    longitude: -47.9,
    motorista: 'João Silva',
  },
  {
    id: '2',
    placa: 'DEF5678',
    modelo: 'VW Gol',
    tipo: VehicleType.CAMINHAO,
    status: VehicleStatus.PARADO,
    velocidade: 0,
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -15.7,
    longitude: -48.0,
    motorista: undefined,
  },
]

describe('Map Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders map container element', () => {
    render(<Map vehicles={mockVehicles} />)
    const mapContainer = document.querySelector('.map-container')
    expect(mapContainer).toBeInTheDocument()
  })

  test('renders fallback table view when Leaflet is not available', () => {
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: null })
    const L = require('leaflet')
    const originalL = { ...L }

    jest.resetModules()
    jest.doMock('leaflet', () => undefined)

    render(<Map vehicles={mockVehicles} />)

    expect(
      screen.getByText('Não foi possível carregar o mapa')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Visualização Alternativa de Veículos')
    ).toBeInTheDocument()
    expect(screen.getByText('ABC1234')).toBeInTheDocument()
    expect(screen.getByText('DEF5678')).toBeInTheDocument()

    jest.doMock('leaflet', () => originalL)
  })

  test('calls onVehicleClick when a marker is clicked', () => {
    const onVehicleClickMock = jest.fn()

    const { rerender } = render(
      <Map vehicles={mockVehicles} onVehicleClick={onVehicleClickMock} />
    )

    const L = require('leaflet')
    const markerInstance = L.marker.mock.results[0].value

    const clickCallback = markerInstance.on.mock.calls.find(
      (call: any[]) => call[0] === 'click'
    )[1]
    clickCallback()

    expect(onVehicleClickMock).toHaveBeenCalledWith(mockVehicles[0])

    rerender(
      <Map vehicles={[mockVehicles[1]]} onVehicleClick={onVehicleClickMock} />
    )
  })
})
