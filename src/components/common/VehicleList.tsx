import type React from 'react'
import type { IVehicle } from '../../types/vehicle.types'
import { VehicleStatus } from '../../types/vehicle.types'

interface VehicleListProps {
  vehicles: IVehicle[]
  onVehicleSelect: (vehicle: IVehicle) => void
  selectedVehicle?: IVehicle | null
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onVehicleSelect,
  selectedVehicle,
}) => {
  return (
    <div className="bg-[#1A1A1D] shadow rounded-lg overflow-hidden border border-[#29292E]">
      <div className="p-4 bg-[#1A1A1D] border-b border-[#29292E]">
        <h2 className="text-lg font-medium text-white">Lista de Veículos</h2>
        <p className="text-sm text-gray-400">
          Total: {vehicles.length} veículos
        </p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            Nenhum veículo encontrado
          </div>
        ) : (
          <ul className="divide-y divide-[#29292E]">
            {vehicles.map(vehicle => (
              <li
                key={vehicle.id}
                className={`p-4 hover:bg-[#29292E] cursor-pointer transition-colors ${selectedVehicle?.id === vehicle.id ? 'bg-[#29292E]' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onVehicleSelect(vehicle)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#8257E5] rounded bg-transparent"
                  aria-pressed={selectedVehicle?.id === vehicle.id}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-white">{vehicle.placa}</p>
                      <p className="text-sm text-gray-300">{vehicle.modelo}</p>
                      {vehicle.motorista && (
                        <p className="text-xs text-gray-400">
                          Motorista: {vehicle.motorista}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          vehicle.status === VehicleStatus.ATIVO ||
                          vehicle.status === VehicleStatus.MOVIMENTO
                            ? 'bg-[#00875F] text-white'
                            : vehicle.status === VehicleStatus.PARADO
                              ? 'bg-[#81D8F7] text-black'
                              : vehicle.status === VehicleStatus.MANUTENCAO
                                ? 'bg-[#FBA94C] text-black'
                                : 'bg-[#F75A68] text-white'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {vehicle.velocidade} km/h
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Última atualização:{' '}
                    {new Date(vehicle.ultimaAtualizacao).toLocaleString(
                      'pt-BR'
                    )}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
