import { fireEvent, render, screen } from '@testing-library/react'
import { VehicleList } from '../../../components/common/VehicleList'
import type { IVehicle } from '../../../types/vehicle.types'
import { VehicleStatus, VehicleType } from '../../../types/vehicle.types'

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
    tipo: VehicleType.CARRO,
    status: VehicleStatus.PARADO,
    velocidade: 0,
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -15.7,
    longitude: -48.0,
    motorista: undefined,
  },
  {
    id: '3',
    placa: 'GHI9012',
    modelo: 'Toyota Corolla',
    tipo: VehicleType.CARRO,
    status: VehicleStatus.MANUTENCAO,
    velocidade: 0,
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -15.9,
    longitude: -47.8,
    motorista: 'Maria Oliveira',
  },
]

describe('VehicleList Component', () => {
  test('renders vehicle list with vehicles', () => {
    render(<VehicleList vehicles={mockVehicles} onVehicleSelect={jest.fn()} />)

    expect(screen.getByText('Lista de Veículos')).toBeInTheDocument()
    expect(
      screen.getByText(`Total: ${mockVehicles.length} veículos`)
    ).toBeInTheDocument()

    expect(screen.getByText('ABC1234')).toBeInTheDocument()
    expect(screen.getByText('Fiat Uno')).toBeInTheDocument()
    expect(screen.getByText('DEF5678')).toBeInTheDocument()
    expect(screen.getByText('VW Gol')).toBeInTheDocument()
    expect(screen.getByText('GHI9012')).toBeInTheDocument()
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument()

    expect(screen.getByText('Motorista: João Silva')).toBeInTheDocument()
    expect(screen.getByText('Motorista: Maria Oliveira')).toBeInTheDocument()

    expect(screen.getByText(VehicleStatus.ATIVO)).toBeInTheDocument()
    expect(screen.getByText(VehicleStatus.PARADO)).toBeInTheDocument()
    expect(screen.getByText(VehicleStatus.MANUTENCAO)).toBeInTheDocument()
  })

  test('shows empty state when no vehicles are provided', () => {
    render(<VehicleList vehicles={[]} onVehicleSelect={jest.fn()} />)

    expect(screen.getByText('Lista de Veículos')).toBeInTheDocument()
    expect(screen.getByText('Total: 0 veículos')).toBeInTheDocument()
    expect(screen.getByText('Nenhum veículo encontrado')).toBeInTheDocument()
  })

  test('calls onVehicleSelect when a vehicle is clicked', () => {
    const onVehicleSelectMock = jest.fn()

    render(
      <VehicleList
        vehicles={mockVehicles}
        onVehicleSelect={onVehicleSelectMock}
      />
    )

    fireEvent.click(screen.getByText('ABC1234').closest('li')!)
    expect(onVehicleSelectMock).toHaveBeenCalledWith(mockVehicles[0])

    fireEvent.click(screen.getByText('DEF5678').closest('li')!)
    expect(onVehicleSelectMock).toHaveBeenCalledWith(mockVehicles[1])
  })

  test('highlights the selected vehicle', () => {
    render(
      <VehicleList
        vehicles={mockVehicles}
        onVehicleSelect={jest.fn()}
        selectedVehicle={mockVehicles[0]}
      />
    )

    const selectedItem = screen.getByText('ABC1234').closest('li')
    expect(selectedItem).toHaveClass('bg-[#29292E]')

    const nonSelectedItem = screen.getByText('DEF5678').closest('li')
    expect(nonSelectedItem).not.toHaveClass('bg-[#29292E]')
  })
})
