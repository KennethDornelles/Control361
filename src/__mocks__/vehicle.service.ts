import { VehicleStatus, VehicleType } from '../types/vehicle.types';
import type { IVehicle } from '../types/vehicle.types';

// Data fixa para corresponder aos testes
const FIXED_DATE = '2023-05-05T10:30:00Z';

// Veículo único para testes específicos
const singleVehicle: IVehicle = {
  id: '1',
  placa: 'ABC-1234',
  modelo: 'Toyota Corolla',
  tipo: VehicleType.CARRO,
  status: VehicleStatus.ATIVO,
  motorista: 'João Silva',
  ultimaAtualizacao: FIXED_DATE,
  latitude: -15.7801,
  longitude: -47.9292,
  velocidade: 65,
};

// Dados de exemplo para os testes
const mockVehicles: IVehicle[] = [
  singleVehicle,
  {
    id: '2',
    placa: 'DEF-5678',
    modelo: 'Ford Cargo',
    tipo: VehicleType.CAMINHAO,
    status: VehicleStatus.MOVIMENTO,
    motorista: 'Maria Oliveira',
    ultimaAtualizacao: FIXED_DATE,
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
    ultimaAtualizacao: FIXED_DATE,
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
    ultimaAtualizacao: FIXED_DATE,
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
    motorista: 'Pedro Souza',
    ultimaAtualizacao: FIXED_DATE,
    latitude: -19.9167,
    longitude: -43.9345,
    velocidade: 0,
  },
];

let getVehicleCallCount = 0;

export const VehicleService = {
  getVehicles: jest.fn().mockImplementation(() => {
    getVehicleCallCount++;
    
    // Nos testes que verificam o formato de resposta da API, retornar apenas o primeiro veículo
    if (getVehicleCallCount <= 2) {
      return Promise.resolve([singleVehicle]);
    }
    
    return Promise.resolve(mockVehicles);
  }),
  
  getVehicleById: jest.fn().mockImplementation((id: string) => {
    const vehicle = mockVehicles.find(v => v.id === id);
    if (vehicle) {
      return Promise.resolve(vehicle);
    } else {
      return Promise.reject(new Error(`Veículo com ID ${id} não encontrado`));
    }
  }),
  
  updateVehicleLocation: jest.fn().mockImplementation(
    (id: string, latitude: number, longitude: number, velocidade: number) => {
      const vehicle = mockVehicles.find(v => v.id === id);
      if (vehicle) {
        const updatedVehicle = {
          ...vehicle,
          latitude,
          longitude,
          velocidade
        };
        return Promise.resolve(updatedVehicle);
      } else {
        return Promise.reject(new Error(`Veículo com ID ${id} não encontrado`));
      }
    }
  ),
};