import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Clock, User, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const AllActivitiesPage = () => {
  const { authToken } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Aumentando o limite para buscar mais atividades
        const response = await fetch('http://localhost:8000/api/v1/audits/recent-activity/?limit=100', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [authToken]);

  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'QUOTE_REQUEST':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'PROPOSAL':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBadge = (actionType) => {
    switch (actionType) {
      case 'QUOTE_REQUEST':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Cotação</Badge>;
      case 'PROPOSAL':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Proposta</Badge>;
      default:
        return <Badge variant="outline">Atividade</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Erro ao carregar atividades: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todas as Atividades</h1>
          <p className="text-gray-600">Histórico completo de atividades do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Atividades Recentes</span>
            </CardTitle>
            <CardDescription>
              Últimas atividades registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={`${activity.action_type}-${activity.id}`} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getActivityBadge(activity.action_type)}
                          <span className="text-sm text-gray-500">#{activity.id}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 font-medium">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllActivitiesPage;