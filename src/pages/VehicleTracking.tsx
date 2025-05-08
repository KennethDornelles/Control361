import type React from 'react'
import { useEffect, useState } from 'react'
import { Map } from '../components/common/Map'
import { VehicleService } from '../services/vehicle.service'
import type { IVehicle } from '../types/vehicle.types'

const VehicleTracking: React.FC = () => {
  const [vehicles, setVehicles] = useState<IVehicle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: -15.7801, lng: -47.9292 })
  const [activeTab, setActiveTab] = useState<'mapa' | 'lista'>('mapa')
  const [searchText, setSearchText] = useState('')

  const fetchVehicles = async () => {
    try {
      const data = await VehicleService.getVehicles()
      setVehicles(data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar veículos:', err)
      setError(
        'Não foi possível carregar os veículos. Por favor, tente novamente.'
      )
    }
  }

  useEffect(() => {
    fetchVehicles()

    const interval = setInterval(
      () => {
        fetchVehicles()
      },
      2 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [])

  const handleVehicleSelect = (vehicle: IVehicle) => {
    setSelectedVehicle(vehicle)
    setMapCenter({ lat: vehicle.latitude, lng: vehicle.longitude })
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      <div className="w-full py-10 flex justify-center items-center flex-col">
        <h1 className="text-5xl font-bold mb-6">Kenneth Dornelles</h1>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar placa ou frota"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="bg-[#121214] border border-[#29292E] rounded-md px-4 py-2 h-10 text-sm w-64 focus:outline-none focus:border-[#8257E5]"
          />
          <button className="bg-[#00B37E] text-white font-medium px-6 py-2 h-10 rounded-md hover:bg-[#00875F] transition-colors">
            Novo
          </button>
        </div>
      </div>

      <main className="container mx-auto px-8 pb-6">
        <div className="mb-6 border-b border-[#29292E]">
          <div className="flex space-x-8">
            <button
              className={`px-1 py-4 font-medium text-base ${
                activeTab === 'mapa'
                  ? 'text-[#8257E5] border-b-2 border-[#8257E5] -mb-px'
                  : 'text-[#7C7C8A] hover:text-white'
              }`}
              onClick={() => setActiveTab('mapa')}
            >
              Mapa rastreador
            </button>
            <button
              className={`px-1 py-4 font-medium text-base ${
                activeTab === 'lista'
                  ? 'text-[#8257E5] border-b-2 border-[#8257E5] -mb-px'
                  : 'text-[#7C7C8A] hover:text-white'
              }`}
              onClick={() => setActiveTab('lista')}
            >
              Lista
            </button>
          </div>
        </div>

        {error && (
          <div
            className="bg-[#F75A68] bg-opacity-10 border border-[#F75A68] text-white px-4 py-3 rounded mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8">
          <Map
            vehicles={vehicles}
            center={mapCenter}
            zoom={selectedVehicle ? 15 : 5}
            onVehicleClick={handleVehicleSelect}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Frotas</h2>
          <div className="bg-[#1A1A1D] rounded-md overflow-hidden border border-[#29292E]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#29292E]">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                      Frota
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#C4C4CC] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1A1A1D] divide-y divide-[#29292E]">
                  {vehicles.map(vehicle => (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-[#29292E] transition-colors ${selectedVehicle?.id === vehicle.id ? 'bg-[#29292E]' : ''}`}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E1E1E6]">
                        {vehicle.placa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E1E1E6]">
                        {vehicle.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E1E1E6]">
                        {vehicle.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E1E1E6]">
                        {vehicle.modelo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${
                                                      vehicle.status ===
                                                      'EM MOVIMENTO'
                                                        ? 'bg-[#00875F] text-white'
                                                        : vehicle.status ===
                                                            'MANUTENÇÃO'
                                                          ? 'bg-[#FBA94C] text-[#121214]'
                                                          : vehicle.status ===
                                                              'INATIVO'
                                                            ? 'bg-[#F75A68] text-white'
                                                            : vehicle.status ===
                                                                'PARADO'
                                                              ? 'bg-[#81D8F7] text-[#121214]'
                                                              : vehicle.status ===
                                                                  'ATIVO'
                                                                ? 'bg-[#00875F] text-white'
                                                                : 'bg-[#81D8F7] text-[#121214]'
                                                    }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VehicleTracking
