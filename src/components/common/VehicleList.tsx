import React from 'react';
import type { IVehicle } from '../../types/vehicle.types';
import { VehicleStatus } from '../../types/vehicle.types';

interface VehicleListProps {
    vehicles: IVehicle[];
    onVehicleSelect: (vehicle: IVehicle) => void;
    selectedVehicle?: IVehicle | null;
}

export const VehicleList: React.FC<VehicleListProps> = ({
    vehicles,
    onVehicleSelect,
    selectedVehicle
}) => {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900">Lista de Veículos</h2>
                <p className="text-sm text-gray-500">Total: {vehicles.length} veículos</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {vehicles.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Nenhum veículo encontrado
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {vehicles.map(vehicle => (
                            <li
                                key={vehicle.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50' : ''}`}
                                onClick={() => onVehicleSelect(vehicle)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{vehicle.placa}</p>
                                        <p className="text-sm text-gray-600">{vehicle.modelo}</p>
                                        {vehicle.motorista && (
                                            <p className="text-xs text-gray-500">Motorista: {vehicle.motorista}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-2 py-1 text-xs rounded-full ${vehicle.status === VehicleStatus.ATIVO || vehicle.status === VehicleStatus.MOVIMENTO ? 'bg-green-100 text-green-800' :
                                                    vehicle.status === VehicleStatus.PARADO ? 'bg-blue-100 text-blue-800' :
                                                        vehicle.status === VehicleStatus.MANUTENCAO ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {vehicle.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{vehicle.velocidade} km/h</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Última atualização: {new Date(vehicle.ultimaAtualizacao).toLocaleString('pt-BR')}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};