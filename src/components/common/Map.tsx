import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
    [VehicleStatus.ATIVO]: '#00C853',     // Verde
    [VehicleStatus.INATIVO]: '#D50000',   // Vermelho
    [VehicleStatus.MANUTENCAO]: '#FFD600', // Amarelo
    [VehicleStatus.PARADO]: '#2962FF',     // Azul
    [VehicleStatus.MOVIMENTO]: '#AA00FF',  // Roxo
};

export const Map: React.FC<MapProps> = ({
    vehicles,
    center = { lat: -15.7801, lng: -47.9292 }, // Centro do Brasil (Brasília) como padrão
    zoom = 5,
    onVehicleClick
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});

    // Inicializar o mapa
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Configurar o mapa
        const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

        // Adicionar a camada do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center.lat, center.lng, zoom]);

    // Atualizar a posição e o zoom do mapa quando o centro ou zoom mudar
    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.setView([center.lat, center.lng], zoom);
    }, [center.lat, center.lng, zoom]);

    // Criar / atualizar marcadores para veículos
    useEffect(() => {
        if (!mapRef.current || !vehicles) return;

        // Lista de IDs para controlar quais marcadores precisam ser removidos
        const currentVehicleIds = new Set<string>();

        // Adicionar ou atualizar marcadores para cada veículo
        vehicles.forEach(vehicle => {
            const vehicleId = vehicle.id.toString();
            currentVehicleIds.add(vehicleId);

            // Criar ícone personalizado baseado no status do veículo
            const vehicleIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background-color: ${statusColors[vehicle.status]}; 
                    width: 12px; 
                    height: 12px; 
                    border-radius: 50%; 
                    border: 2px solid white;
                    box-shadow: 0 0 3px rgba(0,0,0,0.5);
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            // Atualizar marcador existente ou criar um novo
            if (markersRef.current[vehicleId]) {
                markersRef.current[vehicleId].setLatLng([vehicle.latitude, vehicle.longitude]);
                markersRef.current[vehicleId].setIcon(vehicleIcon);
            } else {
                // Garantir que mapRef.current não é null antes de adicionar o marcador
                if (mapRef.current) {
                    const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: vehicleIcon })
                        .addTo(mapRef.current)
                        .on('click', () => handleMarkerClick(vehicle));

                    // Adicionar popup com informações básicas
                    marker.bindTooltip(`${vehicle.placa} - ${vehicle.modelo}`);

                    markersRef.current[vehicleId] = marker;
                }
            }
        });

        // Remover marcadores de veículos que não estão mais na lista
        Object.keys(markersRef.current).forEach(id => {
            if (!currentVehicleIds.has(id) && mapRef.current) {
                mapRef.current.removeLayer(markersRef.current[id]);
                delete markersRef.current[id];
            }
        });
    }, [vehicles]);

    const handleMarkerClick = (vehicle: IVehicle) => {
        if (onVehicleClick) {
            onVehicleClick(vehicle);
        }

        // Se o mapa existir e um veículo foi selecionado, mostrar popup com informações detalhadas
        if (mapRef.current && vehicle) {
            const marker = markersRef.current[vehicle.id.toString()];
            if (marker) {
                marker.unbindPopup();

                const popupContent = `
                    <div style="min-width: 200px;">
                        <h3 style="font-weight: bold; margin-bottom: 5px;">${vehicle.placa}</h3>
                        <p>Modelo: ${vehicle.modelo}</p>
                        <p>Status: ${vehicle.status}</p>
                        <p>Velocidade: ${vehicle.velocidade} km/h</p>
                        ${vehicle.motorista ? `<p>Motorista: ${vehicle.motorista}</p>` : ''}
                    </div>
                `;

                marker.bindPopup(popupContent).openPopup();
            }
        }
    };

    // Exibir solução alternativa se houver algum problema
    if (!L) {
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-md p-4" style={{ height: '500px' }}>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-md mb-4 max-w-lg">
                        <h3 className="font-bold mb-2">Não foi possível carregar o mapa</h3>
                        <p>Houve um problema ao carregar a biblioteca do Leaflet.</p>
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

    return (
        <div
            ref={mapContainerRef}
            className="map-container"
            style={containerStyle}
        />
    );
};