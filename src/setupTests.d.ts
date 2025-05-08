import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      // Adicione outros métodos do jest-dom conforme necessário
    }
  }
}
