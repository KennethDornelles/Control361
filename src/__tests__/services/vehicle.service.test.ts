import axios from 'axios'
import { VehicleService } from '../../services/vehicle.service'
import { VehicleStatus, VehicleType } from '../../types/vehicle.types'

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}))

describe('VehicleService', () => {
  const mockAxiosInstance = axios.create() as jest.Mocked<typeof axios>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getVehicles', () => {
    test('deve retornar dados da API quando a requisição for bem-sucedida (formato items)', async () => {
      const mockApiResponse = {
        data: {
          items: [
            {
              id: '1',
              placa: 'ABC-1234',
              modelo: 'Toyota Corolla',
              tipo: VehicleType.CARRO,
              status: VehicleStatus.ATIVO,
              motorista: 'João Silva',
              ultimaAtualizacao: '2023-05-05T10:30:00Z',
              latitude: -15.7801,
              longitude: -47.9292,
              velocidade: 65,
            },
          ],
        },
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockApiResponse)

      const vehicles = await VehicleService.getVehicles()

      expect(vehicles).toEqual(mockApiResponse.data.items)
    })

    test('deve retornar dados da API quando a requisição for bem-sucedida (formato array)', async () => {
      const mockApiResponse = {
        data: [
          {
            id: '1',
            placa: 'ABC-1234',
            modelo: 'Toyota Corolla',
            tipo: VehicleType.CARRO,
            status: VehicleStatus.ATIVO,
            motorista: 'João Silva',
            ultimaAtualizacao: '2023-05-05T10:30:00Z',
            latitude: -15.7801,
            longitude: -47.9292,
            velocidade: 65,
          },
        ],
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockApiResponse)

      const vehicles = await VehicleService.getVehicles()

      expect(vehicles).toEqual(mockApiResponse.data)
    })

    test('deve retornar dados mockados quando a API retorna erro', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'))

      const vehicles = await VehicleService.getVehicles()

      expect(vehicles).toHaveLength(5)
      expect(vehicles[0].placa).toBe('ABC-1234')
    })

    test('deve retornar dados mockados quando o formato da resposta é desconhecido', async () => {
      const mockApiResponse = {
        data: {
          result: 'success',
        },
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockApiResponse)

      const vehicles = await VehicleService.getVehicles()

      expect(vehicles).toHaveLength(5)
      expect(vehicles[0].placa).toBe('ABC-1234')
    })
  })

  describe('getVehicleById', () => {
    test('deve retornar veículo específico quando a requisição for bem-sucedida', async () => {
      const vehicleId = '1'
      const mockVehicle = {
        id: vehicleId,
        placa: 'ABC-1234',
        modelo: 'Toyota Corolla',
        tipo: VehicleType.CARRO,
        status: VehicleStatus.ATIVO,
        motorista: 'João Silva',
        ultimaAtualizacao: '2023-05-05T10:30:00Z',
        latitude: -15.7801,
        longitude: -47.9292,
        velocidade: 65,
      }
      const mockApiResponse = { data: mockVehicle }

      mockAxiosInstance.get.mockResolvedValueOnce(mockApiResponse)

      const vehicle = await VehicleService.getVehicleById(vehicleId)

      expect(vehicle).toEqual(mockVehicle)
    })

    test('deve retornar veículo mockado quando a API retorna erro e o ID existe nos mocks', async () => {
      const vehicleId = '1'

      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'))

      const vehicle = await VehicleService.getVehicleById(vehicleId)

      expect(vehicle.id).toBe(vehicleId)
      expect(vehicle.placa).toBe('ABC-1234')
    })

    test('deve lançar erro quando a API retorna erro e o ID não existe nos mocks', async () => {
      const vehicleId = 'non-existent-id'

      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(VehicleService.getVehicleById(vehicleId)).rejects.toThrow(
        `Veículo com ID ${vehicleId} não encontrado`
      )
    })
  })

  describe('updateVehicleLocation', () => {
    test('deve atualizar localização do veículo quando a requisição for bem-sucedida', async () => {
      const vehicleId = '1'
      const latitude = -15.8
      const longitude = -47.93
      const velocidade = 70

      const updatedVehicle = {
        id: vehicleId,
        placa: 'ABC-1234',
        modelo: 'Toyota Corolla',
        tipo: VehicleType.CARRO,
        status: VehicleStatus.ATIVO,
        motorista: 'João Silva',
        ultimaAtualizacao: '2023-05-05T10:30:00Z',
        latitude,
        longitude,
        velocidade,
      }

      const mockApiResponse = { data: updatedVehicle }

      mockAxiosInstance.patch.mockResolvedValueOnce(mockApiResponse)

      const vehicle = await VehicleService.updateVehicleLocation(
        vehicleId,
        latitude,
        longitude,
        velocidade
      )

      expect(vehicle).toEqual(updatedVehicle)
    })

    test('deve atualizar veículo mockado quando a API retorna erro e o ID existe nos mocks', async () => {
      const vehicleId = '1'
      const latitude = -15.8
      const longitude = -47.93
      const velocidade = 70

      mockAxiosInstance.patch.mockRejectedValueOnce(new Error('API Error'))

      const vehicle = await VehicleService.updateVehicleLocation(
        vehicleId,
        latitude,
        longitude,
        velocidade
      )

      expect(vehicle.id).toBe(vehicleId)
      expect(vehicle.latitude).toBe(latitude)
      expect(vehicle.longitude).toBe(longitude)
      expect(vehicle.velocidade).toBe(velocidade)
    })

    test('deve lançar erro quando a API retorna erro e o ID não existe nos mocks', async () => {
      const vehicleId = 'non-existent-id'
      const latitude = -15.8
      const longitude = -47.93
      const velocidade = 70

      mockAxiosInstance.patch.mockRejectedValueOnce(new Error('API Error'))

      await expect(
        VehicleService.updateVehicleLocation(
          vehicleId,
          latitude,
          longitude,
          velocidade
        )
      ).rejects.toThrow(`Veículo com ID ${vehicleId} não encontrado`)
    })
  })
})
