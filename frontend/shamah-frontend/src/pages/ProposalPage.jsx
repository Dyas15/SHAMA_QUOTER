import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  Shield,
  DollarSign,
  Truck,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

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
      // Simulando dados para demonstração se a API não estiver disponível
      const mockProposals = [
        {
          id: 1,
          client_name: 'Transportes ABC Ltda',
          status: 'COMPLETED',
          valid_until: '2024-09-28',
          quote_result_details: { premium_value: 2500.00 },
          insurer: 'Shamah Seguros',
          cargo_type: 'Eletrônicos',
          origin: 'São Paulo, SP',
          destination: 'Rio de Janeiro, RJ',
          monthly_revenue: 1000000,
          rctr_c_rate: 0.0250,
          rc_dc_rate: 0.0150,
          rctr_c_limit: 500000,
          rc_dc_limit: 300000,
          observations: 'Cobertura 24h para emergências; Desconto de 5% para renovação'
        },
        {
          id: 2,
          client_name: 'Logística XYZ S.A.',
          status: 'PENDING',
          valid_until: '2024-09-27',
          quote_result_details: { premium_value: 3200.00 },
          insurer: 'Tokio Marine',
          cargo_type: 'Alimentos',
          origin: 'Campinas, SP',
          destination: 'Belo Horizonte, MG',
          monthly_revenue: 1500000,
          rctr_c_rate: 0.0280,
          rc_dc_rate: 0.0180,
          rctr_c_limit: 1000000,
          rc_dc_limit: 500000,
          observations: 'Cliente premium - condições especiais disponíveis'
        }
      ];
      setProposals(mockProposals);
      setError(null);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Pendente', variant: 'secondary', icon: Clock },
      'APPROVED': { label: 'Aprovado', variant: 'default', icon: CheckCircle },
      'REJECTED': { label: 'Rejeitado', variant: 'destructive', icon: AlertCircle },
      'PROCESSING': { label: 'Processando', variant: 'outline', icon: Clock },
      'COMPLETED': { label: 'Concluído', variant: 'default', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando propostas...</p>
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
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Propostas de Seguro</h1>
          <p className="text-gray-600">Gerencie e compare suas propostas de seguro de carga</p>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-gray-500">As propostas aparecerão aqui quando forem geradas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center">
                        <Building className="h-6 w-6 mr-2 text-blue-600" />
                        {proposal.client_name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Shield className="h-4 w-4 mr-2" />
                        {proposal.insurer || 'Seguradora não informada'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(proposal.status)}
                      <p className="text-sm text-gray-500 mt-1">
                        Proposta #{proposal.id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Detalhes</TabsTrigger>
                      <TabsTrigger value="coverage">Coberturas</TabsTrigger>
                      <TabsTrigger value="actions">Ações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Prêmio Mensal</p>
                            <p className="font-semibold">R$ {proposal.quote_result_details?.premium_value?.toLocaleString('pt-BR') || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tipo de Carga</p>
                            <p className="font-semibold">{proposal.cargo_type || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Rota</p>
                            <p className="font-semibold text-sm">{proposal.origin && proposal.destination ? `${proposal.origin} → ${proposal.destination}` : 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Válida até</p>
                            <p className="font-semibold">{new Date(proposal.valid_until).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>

                      {proposal.monthly_revenue && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Faturamento Mensal
                            </h4>
                            <p className="text-lg font-bold text-green-600">
                              R$ {proposal.monthly_revenue.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </>
                      )}

                      {proposal.observations && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Award className="h-4 w-4 mr-2" />
                            Observações Especiais
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {proposal.observations}
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="coverage" className="space-y-4 mt-4">
                      {proposal.rctr_c_rate && proposal.rc_dc_rate ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border border-blue-200">
                            <CardHeader className="bg-blue-50 rounded-t-lg">
                              <CardTitle className="text-lg text-blue-800">RCTR-C</CardTitle>
                              <CardDescription>Responsabilidade Civil do Transportador Rodoviário</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Taxa:</span>
                                  <span className="font-semibold">{(proposal.rctr_c_rate * 100).toFixed(4)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Limite:</span>
                                  <span className="font-semibold">R$ {proposal.rctr_c_limit?.toLocaleString('pt-BR') || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Franquia:</span>
                                  <span className="font-semibold">10% mín. R$ 1.000</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border border-green-200">
                            <CardHeader className="bg-green-50 rounded-t-lg">
                              <CardTitle className="text-lg text-green-800">RC-DC</CardTitle>
                              <CardDescription>Responsabilidade Civil - Desaparecimento de Carga</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Taxa:</span>
                                  <span className="font-semibold">{(proposal.rc_dc_rate * 100).toFixed(4)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Limite:</span>
                                  <span className="font-semibold">R$ {proposal.rc_dc_limit?.toLocaleString('pt-BR') || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Franquia:</span>
                                  <span className="font-semibold">10% mín. R$ 1.000</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Informações de cobertura não disponíveis</p>
                        </div>
                      )}

                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-800">Prêmio Total Mensal</h4>
                              <p className="text-sm text-blue-600">Valor a ser pago mensalmente</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-800">
                                R$ {proposal.quote_result_details?.premium_value?.toLocaleString('pt-BR') || 'N/A'}
                              </p>
                              <p className="text-sm text-blue-600">por mês</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.status === 'PENDING' && hasRole(['Manager']) && (
                          <Button 
                            onClick={() => handleApproveProposal(proposal.id)}
                            className="bg-green-600 hover:bg-green-700 flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar Proposta
                          </Button>
                        )}
                        
                        {proposal.status !== 'COMPLETED' && (
                          <Button 
                            onClick={() => handleGeneratePdf(proposal.id)}
                            disabled={proposal.status === 'PROCESSING'}
                            className="flex items-center justify-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {proposal.status === 'PROCESSING' ? 'Gerando PDF...' : 'Gerar PDF'}
                          </Button>
                        )}
                        
                        {proposal.status === 'COMPLETED' && (
                          <Button 
                            asChild
                            className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
                          >
                            <a
                              href={`/path/to/generated/pdf/${proposal.id}.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </a>
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline"
                          className="flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Detalhes
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="flex items-center justify-center"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Comparar Propostas
                        </Button>
                      </div>

                      <Separator />

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Informações da Proposta</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Válida até:</span>
                            <span className="ml-2 font-medium">
                              {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2">{getStatusBadge(proposal.status)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Seguradora:</span>
                            <span className="ml-2 font-medium">{proposal.insurer || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Prêmio:</span>
                            <span className="ml-2 font-medium">R$ {proposal.quote_result_details?.premium_value?.toLocaleString('pt-BR') || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalPage;


