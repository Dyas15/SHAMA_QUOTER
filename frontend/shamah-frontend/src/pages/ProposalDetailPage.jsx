import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Building,
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import { Separator } from "../components/ui/separator";

const ProposalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/quotes/proposals/${id}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken.access}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProposal(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && authToken?.access) {
      fetchProposalDetails();
    } else if (!authToken) {
      setLoading(false);
      setError("Token de autenticação não encontrado");
    }
  }, [id, authToken?.access]);

  const handleApproveReject = async (action) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/quotes/proposals/${id}/${action}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProposal(data); // Update proposal status
      alert(
        `Proposta ${
          action === "approve" ? "aprovada" : "rejeitada"
        } com sucesso!`
      );
    } catch (error) {
      alert(
        `Erro ao ${action === "approve" ? "aprovar" : "rejeitar"} proposta: ${
          error.message
        }`
      );
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/quotes/proposals/${id}/download_pdf/`,
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposta_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro ao baixar PDF: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da proposta...</p>
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

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Proposta não encontrada.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Voltar
        </Button>
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                Detalhes da Proposta #{proposal.id}
              </div>
              <Badge variant="secondary" className="bg-white text-blue-600">
                {proposal.status}
              </Badge>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Proposta gerada para {proposal.quote_request.client_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Informações do Cliente
                </h3>
                <p>
                  <strong>Nome:</strong> {proposal.quote_request.client_name}
                </p>
                <p>
                  <strong>Documento:</strong>{" "}
                  {proposal.quote_request.client_document}
                </p>
                <p>
                  <strong>Contato:</strong>{" "}
                  {proposal.quote_request.client_contact}
                </p>
                <p>
                  <strong>Endereço:</strong>{" "}
                  {proposal.quote_request.client_address}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Detalhes da Carga
                </h3>
                <p>
                  <strong>Tipo:</strong> {proposal.quote_request.cargo_type}
                </p>
                <p>
                  <strong>Valor:</strong> R${" "}
                  {parseFloat(
                    proposal.quote_request.cargo_value
                  ).toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Origem:</strong> {proposal.quote_request.origin}
                </p>
                <p>
                  <strong>Destino:</strong> {proposal.quote_request.destination}
                </p>
                <p>
                  <strong>Faturamento Mensal:</strong> R${" "}
                  {parseFloat(
                    proposal.quote_request.monthly_revenue
                  ).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Detalhes da Proposta
                </h3>
                <p>
                  <strong>Data da Proposta:</strong>{" "}
                  {new Date(proposal.proposal_date).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Prêmio Total:</strong> R${" "}
                  {parseFloat(proposal.total_premium).toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Taxa RCTR-C:</strong> {proposal.rctr_c_rate}%
                </p>
                <p>
                  <strong>Taxa RC-DC:</strong> {proposal.rc_dc_rate}%
                </p>
                <p>
                  <strong>Limite RCTR-C:</strong> R${" "}
                  {parseFloat(proposal.rctr_c_limit).toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Limite RC-DC:</strong> R${" "}
                  {parseFloat(proposal.rc_dc_limit).toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Válida até:</strong>{" "}
                  {new Date(proposal.valid_until).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Status e Ações
                </h3>
                <p className="mb-2">
                  <strong>Status Atual:</strong>{" "}
                  <Badge>{proposal.status}</Badge>
                </p>
                {proposal.status === "PENDING" && (
                  <div className="flex space-x-2 mt-4">
                    <Button
                      onClick={() => handleApproveReject("approve")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                    </Button>
                    <Button
                      onClick={() => handleApproveReject("reject")}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                    </Button>
                  </div>
                )}
                {proposal.pdf_file && (
                  <Button
                    onClick={handleDownloadPdf}
                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                  >
                    <Download className="h-4 w-4 mr-2" /> Baixar PDF
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalDetailPage;