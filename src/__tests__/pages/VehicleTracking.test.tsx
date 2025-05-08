import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import VehicleTracking from '../../pages/VehicleTracking'
import { VehicleService } from '../../services/vehicle.service'
import type { IVehicle } from '../../types/vehicle.types'
import { VehicleStatus, VehicleType } from '../../types/vehicle.types'

jest.mock('../../services/vehicle.service')

const mockVehicles: IVehicle[] = [
  {
    id: '1',
    placa: 'ABC-1234',
    modelo: 'Toyota Corolla',
    tipo: VehicleType.CARRO,
    status: VehicleStatus.ATIVO,
    motorista: 'João Silva',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -15.7801,
    longitude: -47.9292,
    velocidade: 65,
  },
  {
    id: '2',
    placa: 'DEF-5678',
    modelo: 'Ford Cargo',
    tipo: VehicleType.CAMINHAO,
    status: VehicleStatus.PARADO,
    motorista: 'Maria Oliveira',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -23.5505,
    longitude: -46.6333,
    velocidade: 0,
  },
]

describe('VehicleTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(VehicleService.getVehicles as jest.Mock).mockResolvedValue(mockVehicles)
  })

  test('deve renderizar o título da página', async () => {
    render(<VehicleTracking />)
    expect(screen.getByText('Kenneth Dornelles')).toBeInTheDocument()
  })

  test('deve buscar e exibir veículos ao carregar', async () => {
    render(<VehicleTracking />)

    expect(VehicleService.getVehicles).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByText('ABC-1234')).toBeInTheDocument()
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument()
      expect(screen.getByText('DEF-5678')).toBeInTheDocument()
      expect(screen.getByText('Ford Cargo')).toBeInTheDocument()
    })
  })

  test('deve alternar entre abas', () => {
    render(<VehicleTracking />)

    const mapaTab = screen.getByText('Mapa rastreador')
    const listaTab = screen.getByText('Lista')

    expect(mapaTab).toHaveClass('text-[#8257E5]')
    expect(listaTab).not.toHaveClass('text-[#8257E5]')

    fireEvent.click(listaTab)

    expect(listaTab).toHaveClass('text-[#8257E5]')
    expect(mapaTab).not.toHaveClass('text-[#8257E5]')

    fireEvent.click(mapaTab)

    expect(mapaTab).toHaveClass('text-[#8257E5]')
    expect(listaTab).not.toHaveClass('text-[#8257E5]')
  })

  test('deve selecionar um veículo ao clicar nele', async () => {
    render(<VehicleTracking />)

    await waitFor(() => {
      expect(screen.getByText('ABC-1234')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('ABC-1234').closest('tr')!)

    expect(screen.getByText('ABC-1234').closest('tr')).toHaveClass(
      'bg-[#29292E]'
    )
  })

  test('deve mostrar mensagem de erro quando a API falha', async () => {
    ;(VehicleService.getVehicles as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(<VehicleTracking />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Não foi possível carregar os veículos. Por favor, tente novamente.'
        )
      ).toBeInTheDocument()
    })
  })

  test('deve filtrar veículos ao digitar no campo de busca', async () => {
    render(<VehicleTracking />)

    await waitFor(() => {
      expect(screen.getByText('ABC-1234')).toBeInTheDocument()
      expect(screen.getByText('DEF-5678')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar placa ou frota')

    fireEvent.change(searchInput, { target: { value: 'ABC' } })

    // Implemente aqui a verificação do filtro quando for adicionado na aplicação
    // Por exemplo:
    // expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    // expect(screen.queryByText('DEF-5678')).not.toBeInTheDocument();
  })
})
