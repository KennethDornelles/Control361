import React, { useEffect, useState } from 'react';
import { Map } from '../components/common/Map';
import { VehicleList } from '../components/common/VehicleList';
import { VehicleService } from '../services/vehicle.service';
import type { IVehicle } from '../types/vehicle.types';

const VehicleTracking: React.FC = () => {
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: -15.7801, lng: -47.9292 }); // Brasil (Brasília)

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await VehicleService.getVehicles();
            setVehicles(data);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar veículos:', err);
            setError('Não foi possível carregar os veículos. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();

        // Configurar atualização automática a cada 2 minutos
        const interval = setInterval(() => {
            fetchVehicles();
        }, 2 * 60 * 1000); // 2 minutos em milissegundos

        return () => clearInterval(interval);
    }, []);

    const handleVehicleSelect = (vehicle: IVehicle) => {
        setSelectedVehicle(vehicle);
        setMapCenter({ lat: vehicle.latitude, lng: vehicle.longitude });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Rastreamento de Veículos</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                        <div className="p-4 bg-gray-50 border-b">
                            <h2 className="text-xl font-medium">Mapa de Localização</h2>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Atualização automática a cada 2 minutos</p>
                                <button
                                    onClick={fetchVehicles}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Atualizando...' : 'Atualizar agora'}
                                </button>
                            </div>
                        </div>

                        <Map
                            vehicles={vehicles}
                            center={mapCenter}
                            zoom={selectedVehicle ? 15 : 5}
                            onVehicleClick={handleVehicleSelect}
                        />
                    </div>

                    {selectedVehicle && (
                        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-medium border-b pb-2 mb-3">Detalhes do Veículo</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Placa</p>
                                    <p className="font-medium">{selectedVehicle.placa}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Modelo</p>
                                    <p className="font-medium">{selectedVehicle.modelo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tipo</p>
                                    <p className="font-medium">{selectedVehicle.tipo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium">{selectedVehicle.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Velocidade</p>
                                    <p className="font-medium">{selectedVehicle.velocidade} km/h</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Motorista</p>
                                    <p className="font-medium">{selectedVehicle.motorista || 'Não informado'}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Última atualização: {new Date(selectedVehicle.ultimaAtualizacao).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <VehicleList
                        vehicles={vehicles}
                        onVehicleSelect={handleVehicleSelect}
                        selectedVehicle={selectedVehicle}
                    />
                </div>
            </div>
        </div>
    );
};

export default VehicleTracking;