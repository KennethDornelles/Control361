// Mock para import.meta.env do Vite durante testes
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'https://mock-api-url.com',
      VITE_API_KEY: 'mock-api-key-for-testing'
    }
  }
};