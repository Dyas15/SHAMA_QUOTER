import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PlusCircle, FileText, Calculator, Truck, MapPin, DollarSign, Calendar, User, Building } from 'lucide-react';

const QuoteRequestPage = () => {
  const { authToken } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_document: '',
    client_address: '',
    client_contact: '',
    cargo_type: '',
    cargo_value: '',
    origin: '',
    destination: '',
    monthly_revenue: '',
    general_lmg: '',
    container_lmg: '',
    rj_operation_lmg: ''
  });

  useEffect(() => {
    fetchQuoteRequests();
  }, [authToken]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/quotes/requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.access}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          client_name: '',
          client_document: '',
          client_address: '',
          client_contact: '',
          cargo_type: '',
          cargo_value: '',
          origin: '',
          destination: '',
          monthly_revenue: '',
          general_lmg: '',
          container_lmg: '',
          rj_operation_lmg: ''
        });
        fetchQuoteRequests();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando solicitações de cotação...</p>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Cotações</h1>
          <p className="text-gray-600">Gerencie suas solicitações de seguro de carga</p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Solicitação de Cotação
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <Card className="mb-8 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Calculator className="h-6 w-6 mr-2" />
                Nova Solicitação de Cotação
              </CardTitle>
              <CardDescription className="text-blue-100">
                Preencha os dados para solicitar uma cotação de seguro de carga
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="client" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="client" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Cliente
                    </TabsTrigger>
                    <TabsTrigger value="cargo" className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Carga
                    </TabsTrigger>
                    <TabsTrigger value="limits" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Limites
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="client" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_name">Nome/Razão Social</Label>
                        <Input
                          id="client_name"
                          value={formData.client_name}
                          onChange={(e) => handleInputChange('client_name', e.target.value)}
                          placeholder="Digite o nome do cliente"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_document">CNPJ/CPF</Label>
                        <Input
                          id="client_document"
                          value={formData.client_document}
                          onChange={(e) => handleInputChange('client_document', e.target.value)}
                          placeholder="00.000.000/0000-00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="client_address">Endereço</Label>
                      <Textarea
                        id="client_address"
                        value={formData.client_address}
                        onChange={(e) => handleInputChange('client_address', e.target.value)}
                        placeholder="Endereço completo do cliente"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_contact">Contato</Label>
                      <Input
                        id="client_contact"
                        value={formData.client_contact}
                        onChange={(e) => handleInputChange('client_contact', e.target.value)}
                        placeholder="Telefone/Email de contato"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="cargo" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cargo_type">Tipo de Mercadoria</Label>
                        <Select onValueChange={(value) => handleInputChange('cargo_type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de carga" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alimentos">Alimentos</SelectItem>
                            <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                            <SelectItem value="textil">Têxtil</SelectItem>
                            <SelectItem value="quimicos">Químicos</SelectItem>
                            <SelectItem value="geral">Carga Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cargo_value">Valor Médio por Embarque (R$)</Label>
                        <Input
                          id="cargo_value"
                          type="number"
                          value={formData.cargo_value}
                          onChange={(e) => handleInputChange('cargo_value', e.target.value)}
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origin">Origem</Label>
                        <Input
                          id="origin"
                          value={formData.origin}
                          onChange={(e) => handleInputChange('origin', e.target.value)}
                          placeholder="Cidade/Estado de origem"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="destination">Destino</Label>
                        <Input
                          id="destination"
                          value={formData.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          placeholder="Cidade/Estado de destino"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="monthly_revenue">Faturamento Mensal Estimado (R$)</Label>
                      <Input
                        id="monthly_revenue"
                        type="number"
                        value={formData.monthly_revenue}
                        onChange={(e) => handleInputChange('monthly_revenue', e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="limits" className="space-y-4">
                    <div>
                      <Label htmlFor="general_lmg">LMG Geral (R$)</Label>
                      <Input
                        id="general_lmg"
                        type="number"
                        value={formData.general_lmg}
                        onChange={(e) => handleInputChange('general_lmg', e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="container_lmg">LMG Container (R$)</Label>
                        <Input
                          id="container_lmg"
                          type="number"
                          value={formData.container_lmg}
                          onChange={(e) => handleInputChange('container_lmg', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rj_operation_lmg">LMG Operação RJ (R$)</Label>
                        <Input
                          id="rj_operation_lmg"
                          type="number"
                          value={formData.rj_operation_lmg}
                          onChange={(e) => handleInputChange('rj_operation_lmg', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Solicitar Cotação
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quote Requests List */}
        {quoteRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-500">Clique no botão acima para criar sua primeira solicitação de cotação.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quoteRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      {request.client_name || `Solicitação #${request.id}`}
                    </CardTitle>
                    <Badge variant="secondary">
                      {new Date(request.request_date).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {request.user}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <Truck className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Carga:</span>
                    <span className="ml-1">{request.cargo_type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">Valor:</span>
                    <span className="ml-1">R$ {parseFloat(request.cargo_value).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span className="font-medium">Rota:</span>
                    <span className="ml-1 truncate">{request.origin} → {request.destination}</span>
                  </div>
                  {request.monthly_revenue && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">Faturamento:</span>
                      <span className="ml-1">R$ {parseFloat(request.monthly_revenue).toLocaleString('pt-BR')}/mês</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Gerar Proposta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestPage;

