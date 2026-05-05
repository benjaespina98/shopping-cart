import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ups, algo salió mal.</h2>
          <p className="text-gray-600 mb-6">
            Ha ocurrido un error inesperado. Por favor recarga la página o intenta de nuevo más tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-700/90 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
