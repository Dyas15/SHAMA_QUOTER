import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProposalPage = () => {
  const { authToken, hasRole } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/quotes/proposals/', {
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProposals(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    // Polling para verificar o status do PDF a cada 5 segundos
    const interval = setInterval(fetchProposals, 5000);
    return () => clearInterval(interval);
  }, [authToken]);

  const handleGeneratePdf = async (proposalId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/quotes/proposals/${proposalId}/generate_pdf/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.status || 'Unknown error'}`);
      }
      // Atualiza o status localmente para refletir que a geração começou
      setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'PROCESSING' } : p));
      alert('Geração de PDF iniciada. O status será atualizado em breve.');
    } catch (error) {
      alert(`Erro ao iniciar a geração do PDF: ${error.message}`);
    }
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/quotes/proposals/${proposalId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.status || 'Unknown error'}`);
      }
      // Atualiza o status localmente
      setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'APPROVED' } : p));
      alert('Proposta aprovada com sucesso!');
    } catch (error) {
      alert(`Erro ao aprovar a proposta: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando propostas...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Minhas Propostas</h1>
      {proposals.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma proposta encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Proposta #{proposal.id}</h2>
              <p><strong>Status:</strong> {proposal.status}</p>
              <p><strong>Cliente:</strong> {proposal.client_name}</p>
              <p><strong>Válido até:</strong> {new Date(proposal.valid_until).toLocaleDateString()}</p>
              <p><strong>Valor do Prêmio:</strong> R$ {proposal.quote_result_details?.premium_value || 'N/A'}</p>
              {proposal.status === 'PENDING' && hasRole(['Manager']) && (
                <button
                  onClick={() => handleApproveProposal(proposal.id)}
                  className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Aprovar Proposta
                </button>
              )}
              {proposal.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleGeneratePdf(proposal.id)}
                  className="mt-4 ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={proposal.status === 'PROCESSING'}
                >
                  {proposal.status === 'PROCESSING' ? 'Gerando PDF...' : 'Gerar PDF'}
                </button>
              )}
              {proposal.status === 'COMPLETED' && (
                <a
                  href={`/path/to/generated/pdf/${proposal.id}.pdf`} // Substituir com o caminho real do PDF
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 ml-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-block"
                >
                  Download PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalPage;


