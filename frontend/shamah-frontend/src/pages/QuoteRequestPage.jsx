import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importações dos componentes de UI
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
  const navigate = useNavigate();
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const handleViewDetails = (id) => {
    // Navega para uma página de detalhes da proposta (exemplo)
    navigate(`/proposals/${id}`);
  };

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [quoteRequestIdForCsv, setQuoteRequestIdForCsv] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadCsvTemplate = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/quotes/requests/download_csv_template/",
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "template_itens_cotacao.csv");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        alert("Template CSV descarregado com sucesso!");
      } else {
        alert("Erro ao descarregar o template CSV.");
      }
    } catch (error) {
      alert(`Erro de rede ao descarregar o template CSV: ${error.message}`);
    }
  };

  const handleImportCsv = async () => {
    if (!selectedFile || !quoteRequestIdForCsv) {
      alert("Por favor, selecione um ficheiro CSV e insira o ID da cotação.");
      return;
    }

    const csvFormData = new FormData();
    csvFormData.append("file", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/quotes/requests/${quoteRequestIdForCsv}/import_items_from_csv/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
          body: csvFormData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setSelectedFile(null);
        setQuoteRequestIdForCsv("");
        fetchQuoteRequests();
      } else {
        const errorData = await response.json();
        alert(`Erro na importação: ${errorData.message || errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert(`Erro de rede na importação de CSV: ${error.message}`);
    }
  };

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/quotes/requests/",
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuoteRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (authToken) {
        fetchQuoteRequests();
    }
  }, [authToken]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { field: "client_name", label: "Nome do Cliente" },
      { field: "client_document", label: "Documento do Cliente" },
      { field: "cargo_type", label: "Tipo de Carga" },
      { field: "cargo_value", label: "Valor da Carga" },
      { field: "origin", label: "Origem" },
      { field: "destination", label: "Destino" },
      { field: "monthly_revenue", label: "Faturação Mensal" },
      { field: "general_lmg", label: "LMG Geral" },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`Erro: O campo '${label}' não pode ficar em branco.`);
        return;
      }
    }
    
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/quotes/requests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken.access}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setShowForm(false);
        setFormData({
          client_name: "", client_document: "", client_address: "",
          client_contact: "", cargo_type: "", cargo_value: "",
          origin: "", destination: "", monthly_revenue: "",
          general_lmg: "", container_lmg: "", rj_operation_lmg: "",
        });
        fetchQuoteRequests();
        alert("Solicitação de cotação criada com sucesso!");
      } else {
        const errorData = await response.json();
        const errorMessages = Object.values(errorData).flat();
        alert(`Erro: ${errorMessages.join(", ")}`);
      }
    } catch (error) {
      alert(`Erro de rede: ${error.message}`);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateProposal = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/quotes/requests/${id}/generate_proposal/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      if (response.ok) {
        alert("Proposta gerada com sucesso!");
        fetchQuoteRequests();
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao gerar proposta: ${errorData.detail || response.statusText}`
        );
      }
    } catch (error) {
      alert(`Erro de rede ao gerar proposta: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>A carregar solicitações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Cotações
          </h1>
          <p className="text-gray-600">
            Gira as suas solicitações de cotação de seguro de carga
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Solicitação de Cotação
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow-lg max-w-4xl mx-auto">
            <CardHeader className="bg-gray-100">
              <CardTitle className="flex items-center">
                <Calculator className="h-6 w-6 mr-2" />
                Nova Solicitação de Cotação
              </CardTitle>
              <CardDescription>
                Preencha os dados para solicitar uma cotação de seguro de carga
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="client" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="client"> <User className="h-4 w-4 mr-2" /> Cliente </TabsTrigger>
                    <TabsTrigger value="cargo"> <Truck className="h-4 w-4 mr-2" /> Carga </TabsTrigger>
                    <TabsTrigger value="limits"> <DollarSign className="h-4 w-4 mr-2" /> Limites </TabsTrigger>
                  </TabsList>

                  <TabsContent value="client" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_name">Nome/Razão Social</Label>
                        <Input id="client_name" value={formData.client_name} onChange={(e) => handleInputChange("client_name", e.target.value)} placeholder="Digite o nome do cliente" required />
                      </div>
                      <div>
                        <Label htmlFor="client_document">NIF/NIPC</Label>
                        <Input id="client_document" value={formData.client_document} onChange={(e) => handleInputChange("client_document", e.target.value)} placeholder="000.000.000-00" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="client_address">Endereço</Label>
                      <Textarea id="client_address" value={formData.client_address} onChange={(e) => handleInputChange("client_address", e.target.value)} placeholder="Endereço completo do cliente" rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="client_contact">Contacto</Label>
                      <Input id="client_contact" value={formData.client_contact} onChange={(e) => handleInputChange("client_contact", e.target.value)} placeholder="Telefone/Email de contacto" />
                    </div>
                  </TabsContent>

                  <TabsContent value="cargo" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cargo_type">Tipo de Mercadoria</Label>
                        <Select onValueChange={(value) => handleInputChange("cargo_type", value)} value={formData.cargo_type}>
                          <SelectTrigger><SelectValue placeholder="Selecione o tipo de carga" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alimentos">Alimentos</SelectItem>
                            <SelectItem value="eletronicos">Eletrónicos</SelectItem>
                            <SelectItem value="textil">Têxtil</SelectItem>
                            <SelectItem value="quimicos">Químicos</SelectItem>
                            <SelectItem value="geral">Carga Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cargo_value">Valor Médio por Embarque (€)</Label>
                        <Input id="cargo_value" type="number" value={formData.cargo_value} onChange={(e) => handleInputChange("cargo_value", e.target.value)} placeholder="0,00" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origin">Origem</Label>
                        <Input id="origin" value={formData.origin} onChange={(e) => handleInputChange("origin", e.target.value)} placeholder="Cidade/País de origem" required />
                      </div>
                      <div>
                        <Label htmlFor="destination">Destino</Label>
                        <Input id="destination" value={formData.destination} onChange={(e) => handleInputChange("destination", e.target.value)} placeholder="Cidade/País de destino" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="monthly_revenue">Faturação Mensal Estimada (€)</Label>
                      <Input id="monthly_revenue" type="number" value={formData.monthly_revenue} onChange={(e) => handleInputChange("monthly_revenue", e.target.value)} placeholder="0,00" required />
                    </div>
                  </TabsContent>

                  <TabsContent value="limits" className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="general_lmg">LMG Geral (€)</Label>
                      <Input id="general_lmg" type="number" value={formData.general_lmg} onChange={(e) => handleInputChange("general_lmg", e.target.value)} placeholder="0,00" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="container_lmg">LMG Contentor (€)</Label>
                        <Input id="container_lmg" type="number" value={formData.container_lmg} onChange={(e) => handleInputChange("container_lmg", e.target.value)} placeholder="0,00" />
                      </div>
                      <div>
                        <Label htmlFor="rj_operation_lmg">LMG Operação Especial (€)</Label>
                        <Input id="rj_operation_lmg" type="number" value={formData.rj_operation_lmg} onChange={(e) => handleInputChange("rj_operation_lmg", e.target.value)} placeholder="0,00" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}> Cancelar </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white"> Guardar Solicitação </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center mb-8">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="bg-gray-100">
                    <CardTitle className="flex items-center">
                        <FileText className="h-6 w-6 mr-2" />
                        Importar Itens de Cotação via CSV
                    </CardTitle>
                    <CardDescription>
                        Importe múltiplos itens para uma solicitação de cotação existente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="quoteRequestIdForCsv">ID da Solicitação de Cotação</Label>
                            <Input id="quoteRequestIdForCsv" type="number" value={quoteRequestIdForCsv} onChange={(e) => setQuoteRequestIdForCsv(e.target.value)} placeholder="Insira o ID da cotação" />
                        </div>
                        <div>
                            <Label htmlFor="csvFile">Selecione o ficheiro CSV</Label>
                            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                        <div className="flex justify-between items-center">
                            <Button onClick={handleImportCsv} disabled={!selectedFile || !quoteRequestIdForCsv}> Importar CSV </Button>
                            <Button onClick={handleDownloadCsvTemplate} variant="outline"> Descarregar Modelo CSV </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {quoteRequests.length === 0 && !loading ? (
            <Card className="text-center py-12">
                <CardContent>
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-gray-500">Clique no botão acima para criar a sua primeira solicitação de cotação.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quoteRequests.map((request) => (
                    <Card key={request.id} className="shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                                    {request.client_name || `Solicitação #${request.id}`}
                                </CardTitle>
                                <Badge variant="secondary">{new Date(request.request_date).toLocaleDateString('pt-PT')}</Badge>
                            </div>
                            <CardDescription className="pt-1">{request.user?.username || 'Utilizador desconhecido'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="flex items-center text-sm"><Truck className="h-4 w-4 mr-2" /> <strong>Carga:</strong> {request.cargo_type}</p>
                            <p className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2" /> <strong>Valor:</strong> € {parseFloat(request.cargo_value).toLocaleString('pt-PT')}</p>
                            <p className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2" /> <strong>Rota:</strong> {request.origin} → {request.destination}</p>
                        </CardContent>
                        <div className="p-6 pt-0 flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(request.id)}>Ver Detalhes</Button>
                            <Button size="sm" onClick={() => handleGenerateProposal(request.id)}>Gerar Proposta</Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestPage;