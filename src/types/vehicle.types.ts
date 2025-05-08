export interface IVehicle {
  id: string
  placa: string
  modelo: string
  tipo: VehicleType
  status: VehicleStatus
  motorista?: string
  ultimaAtualizacao: string
  latitude: number
  longitude: number
  velocidade: number
}

export const VehicleType = {
  CARRO: 'CARRO',
  CAMINHAO: 'CAMINHÃO',
  MOTO: 'MOTO',
  VAN: 'VAN',
  ONIBUS: 'ÔNIBUS',
} as const

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType]

export const VehicleStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  MANUTENCAO: 'MANUTENÇÃO',
  PARADO: 'PARADO',
  MOVIMENTO: 'EM MOVIMENTO',
} as const

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus]

export interface IVehicleLocation {
  latitude: number
  longitude: number
}
