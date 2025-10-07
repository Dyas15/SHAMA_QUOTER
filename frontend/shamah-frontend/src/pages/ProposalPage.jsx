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
  Award,
  XCircle // Ícone corrigido
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProposalPage = () => {
  const { authToken, hasRole } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleRejectProposal = async (proposalId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/quotes/proposals/${proposalId}/reject/`, {
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
      setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'REJECTED' } : p));
      alert('Proposta rejeitada com sucesso!');
    } catch (error) {
      alert(`Erro ao rejeitar a proposta: ${error.message}`);
    }
  };

  const handleDownloadPdf = async (proposalId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/quotes/proposals/${proposalId}/download_pdf/`, {
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposta_${proposalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro ao baixar PDF: ${error.message}`);
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
                        {proposal.quote_request?.client_name || `Proposta #${proposal.id}`}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Shield className="h-4 w-4 mr-2" />
                        {proposal.insurer_name || 'Seguradora não informada'}
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
                            <p className="text-sm text-gray-500">Prêmio Total</p>
                            <p className="font-semibold">R$ {parseFloat(proposal.total_premium).toLocaleString('pt-BR') || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tipo de Carga</p>
                            <p className="font-semibold">{proposal.quote_request?.cargo_type || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Rota</p>
                            <p className="font-semibold text-sm">{proposal.quote_request?.origin && proposal.quote_request?.destination ? `${proposal.quote_request.origin} → ${proposal.quote_request.destination}` : 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Data da Proposta</p>
                            <p className="font-semibold">{new Date(proposal.proposal_date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>

                      {proposal.quote_request?.monthly_revenue && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Faturamento Mensal
                            </h4>
                            <p className="text-lg font-bold text-green-600">
                              R$ {parseFloat(proposal.quote_request.monthly_revenue).toLocaleString('pt-BR')}
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
                                  <span className="font-semibold">R$ {parseFloat(proposal.general_lmg).toLocaleString('pt-BR') || 'N/A'}</span>
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
                                  <span className="font-semibold">R$ {parseFloat(proposal.rc_dc_limit).toLocaleString('pt-BR') || 'N/A'}</span>
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
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">LMG Container</p>
                              <p className="font-semibold">R$ {parseFloat(proposal.container_lmg).toLocaleString('pt-BR') || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">LMG Operação RJ</p>
                              <p className="font-semibold">R$ {parseFloat(proposal.rj_operation_lmg).toLocaleString('pt-BR') || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4 mt-4">
                      <div className="flex flex-col space-y-2">
                        {proposal.status === 'PENDING' && hasRole(['Manager']) && (
                          <div className="flex space-x-2">
                            <Button onClick={() => handleApproveProposal(proposal.id)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" /> Aprovar Proposta
                            </Button>
                            <Button onClick={() => handleRejectProposal(proposal.id)} className="bg-red-500 hover:bg-red-600">
                              <XCircle className="h-4 w-4 mr-2" /> Rejeitar Proposta
                            </Button>
                          </div>
                        )}
                        {proposal.pdf_file && (
                          <Button onClick={() => handleDownloadPdf(proposal.id)} className="bg-blue-500 hover:bg-blue-600">
                            <Download className="h-4 w-4 mr-2" /> Baixar PDF
                          </Button>
                        )}
                        {!proposal.pdf_file && proposal.status === 'COMPLETED' && hasRole(['Broker', 'Manager']) && (
                          <Button onClick={() => handleGeneratePdf(proposal.id)} className="bg-purple-500 hover:bg-purple-600">
                            <FileText className="h-4 w-4 mr-2" /> Gerar PDF da Proposta
                          </Button>
                        )}
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