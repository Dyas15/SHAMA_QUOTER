import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const QuoteRequestPage = () => {
  const { authToken } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuoteRequests = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/quotes/requests/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuoteRequests(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteRequests();
  }, [authToken]);

  if (loading) return <div className="text-center py-8">Carregando solicitações de cotação...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Minhas Solicitações de Cotação</h1>
      {quoteRequests.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma solicitação de cotação encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quoteRequests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Solicitação #{request.id}</h2>
              <p><strong>Usuário:</strong> {request.user}</p>
              <p><strong>Data:</strong> {new Date(request.request_date).toLocaleDateString()}</p>
              <p><strong>Tipo de Carga:</strong> {request.cargo_type}</p>
              <p><strong>Valor da Carga:</strong> R$ {request.cargo_value}</p>
              <p><strong>Origem:</strong> {request.origin}</p>
              <p><strong>Destino:</strong> {request.destination}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteRequestPage;


