import axios from 'axios'
import type { IVehicle } from '../types/vehicle.types'
import { VehicleStatus, VehicleType } from '../types/vehicle.types'

// Usando as variáveis de ambiente do Vite
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://develop-back-rota.rota361.com.br/recruitment'
const API_TOKEN = import.meta.env.VITE_API_KEY || ''

console.log('API URL:', API_URL)
console.log(
  'API Token (parcial):',
  API_TOKEN ? `${API_TOKEN.substring(0, 5)}...` : 'Não definido'
)

// Dados de exemplo para quando a API não estiver disponível
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
    status: VehicleStatus.MOVIMENTO,
    motorista: 'Maria Oliveira',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -23.5505,
    longitude: -46.6333,
    velocidade: 45,
  },
  {
    id: '3',
    placa: 'GHI-9012',
    modelo: 'Honda CG',
    tipo: VehicleType.MOTO,
    status: VehicleStatus.PARADO,
    motorista: 'Carlos Santos',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -22.9068,
    longitude: -43.1729,
    velocidade: 0,
  },
  {
    id: '4',
    placa: 'JKL-3456',
    modelo: 'Mercedes Sprinter',
    tipo: VehicleType.VAN,
    status: VehicleStatus.INATIVO,
    motorista: 'Ana Costa',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -30.0277,
    longitude: -51.2287,
    velocidade: 0,
  },
  {
    id: '5',
    placa: 'MNO-7890',
    modelo: 'Volvo B270F',
    tipo: VehicleType.ONIBUS,
    status: VehicleStatus.MANUTENCAO,
    motorista: 'Ana Costa',
    ultimaAtualizacao: new Date().toISOString(),
    latitude: -19.9167,
    longitude: -43.9345,
    velocidade: 0,
  },
]

// Criando uma instância do axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adicionar token de autorização se disponível
if (API_TOKEN) {
  apiClient.interceptors.request.use(config => {
    // Tentando diferentes formatos de autorização
    config.headers.Authorization = API_TOKEN
    return config
  })
}

// Adicionar interceptor para debugging
apiClient.interceptors.request.use(request => {
  console.log('Request:', request.method, request.url)
  return request
})

apiClient.interceptors.response.use(
  response => {
    console.log('Response Status:', response.status)
    return response
  },
  error => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    )
    return Promise.reject(error)
  }
)

export const VehicleService = {
  async getVehicles(): Promise<IVehicle[]> {
    try {
      console.log('Obtendo lista de veículos da API...')

      // Endpoint direto do Swagger para listar veículos
      const response = await apiClient.get('/vehicles/list-with-paginate')

      if (response.data?.items && Array.isArray(response.data.items)) {
        console.log(`Recebidos ${response.data.items.length} veículos da API`)
        return response.data.items
      }

      if (Array.isArray(response.data)) {
        console.log(`Recebidos ${response.data.length} veículos da API`)
        return response.data
      }

      console.warn(
        'Formato de resposta não reconhecido. Usando dados de exemplo.'
      )
      return mockVehicles
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
      console.warn('Usando dados de exemplo para veículos.')
      return mockVehicles
    }
  },

  async getVehicleById(id: string): Promise<IVehicle> {
    try {
      const response = await apiClient.get(`/vehicles/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar veículo com ID ${id}:`, error)

      // Retornar veículo de exemplo compatível com o ID solicitado
      const mockVehicle = mockVehicles.find(v => v.id === id)
      if (mockVehicle) {
        return mockVehicle
      }
      throw new Error(`Veículo com ID ${id} não encontrado`)
    }
  },

  async updateVehicleLocation(
    id: string,
    latitude: number,
    longitude: number,
    velocidade: number
  ): Promise<IVehicle> {
    try {
      const response = await apiClient.patch(`/vehicles/${id}/location`, {
        latitude,
        longitude,
        velocidade,
      })
      return response.data
    } catch (error) {
      console.error(
        `Erro ao atualizar localização do veículo com ID ${id}:`,
        error
      )

      // Simulando atualização em dados de exemplo
      const mockVehicleIndex = mockVehicles.findIndex(v => v.id === id)
      if (mockVehicleIndex >= 0) {
        mockVehicles[mockVehicleIndex] = {
          ...mockVehicles[mockVehicleIndex],
          latitude,
          longitude,
          velocidade,
          ultimaAtualizacao: new Date().toISOString(),
        }
        return mockVehicles[mockVehicleIndex]
      }
      throw new Error(`Veículo com ID ${id} não encontrado`)
    }
  },
}
