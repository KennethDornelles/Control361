// Mock para o Leaflet
const markerMock = {
  addTo: jest.fn().mockReturnThis(),
  on: jest.fn((event, callback) => {
    // Armazenar o callback para poder testá-lo
    if (event === 'click') {
      markerMock._clickHandler = callback;
    }
    return markerMock;
  }),
  bindPopup: jest.fn().mockReturnThis(),
  bindTooltip: jest.fn().mockReturnThis(),
  _clickHandler: null,
};

const mapMock = {
  setView: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  addLayer: jest.fn().mockReturnThis(),
  removeLayer: jest.fn().mockReturnThis(),
};

const mockLeaflet = {
  map: jest.fn().mockReturnValue(mapMock),
  tileLayer: jest.fn().mockReturnValue({
    addTo: jest.fn().mockReturnThis(),
  }),
  marker: jest.fn().mockReturnValue(markerMock),
  divIcon: jest.fn().mockReturnValue({}),
  icon: jest.fn().mockReturnValue({}),
  latLng: jest.fn().mockImplementation((lat, lng) => [lat, lng]),
  control: {
    zoom: jest.fn().mockReturnValue({
      addTo: jest.fn().mockReturnThis()
    })
  },
  // Mock para a propriedade Browser do Leaflet
  Browser: {
    mobile: false
  }
};

// Configurando a propriedade mock.results para que possa ser acessada nos testes
mockLeaflet.marker.mock = {
  results: [{ value: markerMock }]
};

// Mock que indica se o Leaflet está disponível
mockLeaflet.isAvailable = true;

module.exports = mockLeaflet;