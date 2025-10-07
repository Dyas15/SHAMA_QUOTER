import React, { useState, useEffect, createContext, useContext } from 'react';
import { PlusCircle, FileText, Calculator, Truck, MapPin, DollarSign, Calendar, User, Building } from 'lucide-react';

// --- Início dos Componentes de UI e Contexto de Autenticação ---
// Para resolver os erros de importação, os componentes de UI e o contexto de autenticação
// foram recriados aqui de forma simplificada.

// Contexto de Autenticação
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);
const AuthProvider = ({ children }) => {
  const auth = { authToken: { access: 'mock-token-for-development' } };
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Componentes de UI (estilizados com Tailwind CSS)
const Card = ({ className = '', children }) => <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ className = '', children }) => <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
const CardTitle = ({ className = '', children }) => <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ className = '', children }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const CardContent = ({ className = '', children }) => <div className={`p-6 ${className}`}>{children}</div>;

const Button = ({ className = '', variant, size, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
  };
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  };
  const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${className}`;
  return <button className={styles} {...props} />;
};

const Input = ({ className = '', ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
);

const Label = ({ className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
);

const Separator = ({ className = '' }) => <hr className={`border-gray-200 ${className}`} />;

// Componentes de Select
const SelectContext = createContext();
const Select = ({ children, onValueChange, value }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    const handleSelect = (val) => {
        setSelectedValue(val);
        if (onValueChange) onValueChange(val);
        setIsOpen(false);
    };

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    return (
        <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue, handleSelect }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    );
};
const SelectTrigger = ({ children, className = '' }) => {
    const { setIsOpen, isOpen } = useContext(SelectContext);
    return (
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 px-3 text-sm ${className}`}>
            {children}
        </button>
    );
};
const SelectValue = ({ placeholder }) => {
    const { selectedValue } = useContext(SelectContext);
    return <span>{selectedValue || placeholder}</span>;
};
const SelectContent = ({ children, className = '' }) => {
    const { isOpen } = useContext(SelectContext);
    if (!isOpen) return null;
    return <div className={`absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg ${className}`}>{children}</div>;
};
const SelectItem = ({ value, children, className = '' }) => {
    const { handleSelect } = useContext(SelectContext);
    return <div onClick={() => handleSelect(value)} className={`cursor-pointer p-2 text-sm hover:bg-gray-100 ${className}`}>{children}</div>;
};


const Badge = ({ className = '', variant, ...props }) => (
    <div className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'} ${className}`} {...props} />
);

// Componentes de Tabs
const TabsContext = createContext();
const Tabs = ({ defaultValue, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};
const TabsList = ({ children, className = '' }) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>{children}</div>;
const TabsTrigger = ({ value, children, className = '' }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === value;
    return (
        <button onClick={() => setActiveTab(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm' : ''} ${className}`}>
            {children}
        </button>
    );
};
const TabsContent = ({ value, children, className = '' }) => {
    const { activeTab } = useContext(TabsContext);
    return activeTab === value ? <div className={`mt-2 ${className}`}>{children}</div> : null;
};
// --- Fim dos Componentes de UI e Contexto de Autenticação ---


const QuoteRequestPage = () => {
  const { authToken } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // A dependência 'useNavigate' foi removida e a função foi simplificada
  const handleViewDetails = (id) => {
    alert(`A navegar para os detalhes da proposta #${id}`);
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
    } catch (error) { // CORREÇÃO: Removido '=>'
      setError(error.message);
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

    const numericFields = ["cargo_value", "monthly_revenue", "general_lmg"];
    for (const field of numericFields) {
      if (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) <= 0) {
        const labels = {
          cargo_value: "Valor da Carga",
          monthly_revenue: "Faturação Mensal",
          general_lmg: "LMG Geral",
        };
        alert(`Erro: O campo '${labels[field]}' deve ser um número maior que zero.`);
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
        console.error("Erro ao solicitar cotação:", errorData);

        if (errorData && typeof errorData === "object") {
          const errorMessages = Object.values(errorData).flat();
          alert(`Erro: ${errorMessages.join(", ")}`);
        } else {
          alert(errorData.detail || "Erro desconhecido ao solicitar cotação.");
        }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar solicitações de cotação...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Cotações
          </h1>
          <p className="text-gray-600">
            Gira as suas solicitações de cotação de seguro de carga
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Solicitação de Cotação
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow-xl border-0 max-w-4xl mx-auto">
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
            <Card className="w-full max-w-4xl shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                        <FileText className="h-6 w-6 mr-2" />
                        Importar Itens de Cotação via CSV
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                        Importe múltiplos itens para uma solicitação de cotação existente usando um ficheiro CSV.
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
                            <Button onClick={handleImportCsv} disabled={!selectedFile || !quoteRequestIdForCsv} className="bg-purple-600 hover:bg-purple-700 text-white"> Importar CSV </Button>
                            <Button onClick={handleDownloadCsvTemplate} variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50"> Descarregar Modelo CSV </Button>
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
                    <Card key={request.id} className="hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                                    {request.client_name || `Solicitação #${request.id}`}
                                </CardTitle>
                                <Badge variant="secondary">{new Date(request.request_date).toLocaleDateString('pt-PT')}</Badge>
                            </div>
                            <CardDescription className="flex items-center pt-1"><User className="h-4 w-4 mr-1" />{request.user?.username || 'Utilizador desconhecido'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            <div className="flex items-center text-sm"><Truck className="h-4 w-4 mr-2 text-gray-500" /> <span className="font-medium">Carga:</span><span className="ml-1">{request.cargo_type}</span></div>
                            <div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2 text-green-500" /> <span className="font-medium">Valor:</span><span className="ml-1">€ {parseFloat(request.cargo_value).toLocaleString('pt-PT')}</span></div>
                            <div className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2 text-red-500" /> <span className="font-medium">Rota:</span><span className="ml-1 truncate">{request.origin} → {request.destination}</span></div>
                            {request.monthly_revenue && (<div className="flex items-center text-sm"><Calendar className="h-4 w-4 mr-2 text-gray-500" /> <span className="font-medium">Faturação Mensal:</span><span className="ml-1">€ {parseFloat(request.monthly_revenue).toLocaleString('pt-PT')}</span></div>)}
                            <div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2 text-blue-500" /> <span className="font-medium">LMG Geral:</span><span className="ml-1">€ {parseFloat(request.general_lmg).toLocaleString('pt-PT')}</span></div>
                            {request.container_lmg && parseFloat(request.container_lmg) > 0 && (<div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2 text-blue-500" /> <span className="font-medium">LMG Contentor:</span><span className="ml-1">€ {parseFloat(request.container_lmg).toLocaleString('pt-PT')}</span></div>)}
                            {request.rj_operation_lmg && parseFloat(request.rj_operation_lmg) > 0 && (<div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2 text-blue-500" /> <span className="font-medium">LMG Op. Especial:</span><span className="ml-1">€ {parseFloat(request.rj_operation_lmg).toLocaleString('pt-PT')}</span></div>)}
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

// O componente principal da aplicação que inclui o AuthProvider
const App = () => {
    return (
        <AuthProvider>
            <QuoteRequestPage />
        </AuthProvider>
    );
};

export default App;