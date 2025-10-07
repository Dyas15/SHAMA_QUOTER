import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart3, FileText, DollarSign } from 'lucide-react';

const ReportsPage = () => {
  const { authToken } = useAuth();
  const [quotesByStatus, setQuotesByStatus] = useState([]);
  const [proposalsByInsurer, setProposalsByInsurer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch Quotes by Status
        const quotesResponse = await fetch('http://localhost:8000/api/v1/audits/reports/quotes-by-status/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!quotesResponse.ok) throw new Error(`HTTP error! status: ${quotesResponse.status}`);
        const quotesData = await quotesResponse.json();
        setQuotesByStatus(quotesData);

        // Fetch Proposals by Insurer
        const proposalsResponse = await fetch('http://localhost:8000/api/v1/audits/reports/proposals-by-insurer/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!proposalsResponse.ok) throw new Error(`HTTP error! status: ${proposalsResponse.status}`);
        const proposalsData = await proposalsResponse.json();
        setProposalsByInsurer(proposalsData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Erro: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Relatórios</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Cotações por Status
              </CardTitle>
              <CardDescription className="text-blue-100">
                Número de solicitações de cotação por status atual
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {quotesByStatus.length === 0 ? (
                <p className="text-gray-500">Nenhum dado disponível para este relatório.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {quotesByStatus.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-semibold">{item.status}:</span> {item.count}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <DollarSign className="h-6 w-6 mr-2" />
                Prêmio Total por Seguradora
              </CardTitle>
              <CardDescription className="text-green-100">
                Soma dos prêmios totais das propostas concluídas por seguradora
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {proposalsByInsurer.length === 0 ? (
                <p className="text-gray-500">Nenhum dado disponível para este relatório.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {proposalsByInsurer.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-semibold">{item.quote_result__insurer__name || 'Não Informado'}:</span> R$ {parseFloat(item.total_premium).toLocaleString('pt-BR')}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;


