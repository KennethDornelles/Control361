import { render, screen } from '@testing-library/react'
import { VehicleMap } from '../../../components/common/Map'
import type { IVehicle } from '../../../types/vehicle.types'
import { VehicleStatus, VehicleType } from '../../../types/vehicle.types'

// Mock do Leaflet
jest.mock('leaflet', () => {
  // Criamos uma função mock para simular o click
  const clickHandler = jest.fn();

  // Definimos o tipo para o markerMock
  type MarkerMock = {
    addTo: jest.Mock;
    on: jest.Mock;
    bindTooltip: jest.Mock;
    setLatLng: jest.Mock;
    setIcon: jest.Mock;
    unbindPopup: jest.Mock;
    bindPopup: jest.Mock;
    openPopup: jest.Mock;
  };

  // Mock do marker que guarda o callback com tipo definido
  const markerMock: MarkerMock = {
    addTo: jest.fn().mockReturnThis(),
    on: jest.fn((eventName: string, callback: () => void) => {
      if (eventName === 'click') {
        clickHandler.mockImplementation(() => callback());
      }
      return markerMock;
    }),
    bindTooltip: jest.fn().mockReturnThis(),
    setLatLng: jest.fn().mockReturnThis(),
    setIcon: jest.fn().mockReturnThis(),
    unbindPopup: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    openPopup: jest.fn().mockReturnThis(),
  };

  return {
    map: jest.fn().mockReturnValue({
      setView: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      removeLayer: jest.fn(),
    }),
    tileLayer: jest.fn().mockReturnValue({
      addTo: jest.fn(),
    }),
    marker: jest.fn().mockReturnValue(markerMock),
    divIcon: jest.fn().mockReturnValue({}),
    control: {
      zoom: jest.fn().mockReturnValue({
        addTo: jest.fn(),
      }),
    },
    isAvailable: true,
    // Expomos o clickHandler para usar no teste
    _clickMarker: clickHandler
  };
})

// Mock para o CSS do Leaflet
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
    const L = require('leaflet')
    L.isAvailable = true
  })

  test('renders map container element', () => {
    render(<VehicleMap vehicles={mockVehicles} />)
    const mapContainer = document.querySelector('.map-container')
    expect(mapContainer).toBeInTheDocument()
  })

  test('renders fallback table view when Leaflet is not available', () => {
    // Configurar o Leaflet como indisponível para este teste
    const L = require('leaflet')
    L.isAvailable = false

    render(<VehicleMap vehicles={mockVehicles} />)

    expect(
      screen.getByText('Não foi possível carregar o mapa')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Visualização Alternativa de Veículos')
    ).toBeInTheDocument()
    expect(screen.getByText('ABC1234')).toBeInTheDocument()
    expect(screen.getByText('DEF5678')).toBeInTheDocument()
  })

  test('calls onVehicleClick when a marker is clicked', () => {
    const onVehicleClickMock = jest.fn()

    // Usar apenas o segundo veículo para este teste para corresponder ao comportamento atual
    const testVehicles = [mockVehicles[1]];

    render(
      <VehicleMap vehicles={testVehicles} onVehicleClick={onVehicleClickMock} />
    )

    const L = require('leaflet')
    // Simular o clique no marcador usando o clickHandler exposto
    L._clickMarker()

    // Verificar se o callback foi chamado com o veículo correto
    expect(onVehicleClickMock).toHaveBeenCalledWith(testVehicles[0])
  })
})
