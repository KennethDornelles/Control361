import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { IVehicle } from '../../types/vehicle.types';
import { VehicleStatus } from '../../types/vehicle.types';

interface MapProps {
    vehicles: IVehicle[];
    center?: { lat: number; lng: number };
    zoom?: number;
    onVehicleClick?: (vehicle: IVehicle) => void;
}

const containerStyle = {
    width: '100%',
    height: '500px'
};

// Cores diferentes para cada status de veículo
const statusColors = {
    [VehicleStatus.ATIVO]: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    [VehicleStatus.INATIVO]: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    [VehicleStatus.MANUTENCAO]: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    [VehicleStatus.PARADO]: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    [VehicleStatus.MOVIMENTO]: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
};

export const Map: React.FC<MapProps> = ({
    vehicles,
    center = { lat: -15.7801, lng: -47.9292 }, // Centro do Brasil (Brasília) como padrão
    zoom = 5,
    onVehicleClick
}) => {
    const [useFallback, setUseFallback] = useState(false);

    // Tentativa de obter a chave da API do Google Maps das variáveis de ambiente
    const googleMapsApiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || '';

    // Log para verificar se a chave da API está sendo carregada corretamente
    useEffect(() => {
        console.log('Chave do Google Maps (primeiros caracteres):',
            googleMapsApiKey ? `${googleMapsApiKey.substring(0, 5)}...` : 'Não definida');

        if (!googleMapsApiKey) {
            console.error('Chave da API do Google Maps não encontrada no arquivo .env');
            setUseFallback(true);
        }
    }, [googleMapsApiKey]);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        version: 'weekly',
        language: 'pt-BR',
        region: 'BR',
        nonce: undefined,
        authReferrerPolicy: 'origin'
    });

    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);

    const handleMarkerClick = (vehicle: IVehicle) => {
        setSelectedVehicle(vehicle);
        if (onVehicleClick) {
            onVehicleClick(vehicle);
        }
    };

    // Função para lidar com o carregamento do mapa
    const onLoad = useCallback(() => {
        console.log('Mapa carregado com sucesso');
    }, []);

    // Função para lidar com o descarregamento do mapa
    const onUnmount = useCallback(() => {
        console.log('Mapa descarregado');
    }, []);

    // Monitora o estado de loadError e força useFallback se houver qualquer erro
    useEffect(() => {
        if (loadError) {
            console.error('Erro ao carregar Google Maps API:', loadError.message);
            setUseFallback(true);
        }
    }, [loadError]);

    // Exibir solução alternativa se o mapa não carregar
    if (loadError || useFallback) {
        console.warn('Usando visualização alternativa devido a problemas com Google Maps API');
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-md p-4" style={{ height: '500px' }}>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-md mb-4 max-w-lg">
                        <h3 className="font-bold mb-2">Não foi possível carregar o mapa</h3>
                        <p>Por favor, verifique se:</p>
                        <ol className="list-decimal pl-5 mt-2">
                            <li>A chave da API do Google Maps está configurada corretamente no arquivo .env</li>
                            <li>A chave tem as APIs necessárias ativadas (Maps JavaScript API, Geocoding API)</li>
                            <li>A chave não possui restrições de domínio ou as restrições incluem seu domínio atual</li>
                        </ol>
                        <div className="mt-3 text-xs bg-amber-50 p-2 rounded">
                            Erro: {loadError ? loadError.message : 'Chave da API não configurada ou inválida'}
                        </div>
                    </div>

                    {vehicles && vehicles.length > 0 ? (
                        <div className="bg-white p-4 rounded-md shadow-sm w-full max-w-lg">
                            <h3 className="font-bold mb-2">Visualização Alternativa de Veículos</h3>
                            <div className="overflow-y-auto max-h-64">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vehicles.map((vehicle) => (
                                            <tr
                                                key={vehicle.id}
                                                onClick={() => handleMarkerClick(vehicle)}
                                                className="hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{vehicle.placa}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{vehicle.modelo}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{vehicle.status}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                    {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">
                            Nenhum veículo encontrado para exibir.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100">
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p>Carregando o mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-container" style={{ width: '100%', height: '500px' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    zoomControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    gestureHandling: 'cooperative'
                }}
            >
                {vehicles && vehicles.map((vehicle) => (
                    <Marker
                        key={vehicle.id}
                        position={{ lat: vehicle.latitude, lng: vehicle.longitude }}
                        icon={statusColors[vehicle.status]}
                        onClick={() => handleMarkerClick(vehicle)}
                        title={`${vehicle.placa} - ${vehicle.modelo}`}
                    />
                ))}

                {selectedVehicle && (
                    <InfoWindow
                        position={{ lat: selectedVehicle.latitude, lng: selectedVehicle.longitude }}
                        onCloseClick={() => setSelectedVehicle(null)}
                    >
                        <div className="p-2">
                            <h3 className="font-bold">{selectedVehicle.placa}</h3>
                            <p>Modelo: {selectedVehicle.modelo}</p>
                            <p>Status: {selectedVehicle.status}</p>
                            <p>Velocidade: {selectedVehicle.velocidade} km/h</p>
                            {selectedVehicle.motorista && <p>Motorista: {selectedVehicle.motorista}</p>}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};