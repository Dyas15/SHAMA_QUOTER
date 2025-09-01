import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  Calculator, 
  Shield, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  Activity,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout, hasRole, authToken } = useAuth();
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingProposals: 0,
    completedProposals: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simular carregamento de estatísticas
    setStats({
      totalQuotes: 24,
      pendingProposals: 8,
      completedProposals: 16,
      monthlyRevenue: 125000
    });

    // Simular atividades recentes
    setRecentActivity([
      { id: 1, type: 'quote', description: 'Nova cotação para Transportes ABC', time: '2 horas atrás' },
      { id: 2, type: 'proposal', description: 'Proposta aprovada para Logística XYZ', time: '4 horas atrás' },
      { id: 3, type: 'quote', description: 'Cotação atualizada para Cargas Ltda', time: '1 dia atrás' },
    ]);
  }, []);

  const quickActions = [
    {
      title: 'Nova Cotação',
      description: 'Criar uma nova solicitação de cotação',
      icon: Calculator,
      link: '/quotes',
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['Broker', 'Manager']
    },
    {
      title: 'Gerenciar Propostas',
      description: 'Visualizar e gerenciar propostas',
      icon: FileText,
      link: '/proposals',
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['Broker', 'Manager', 'Auditor']
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios e análises',
      icon: BarChart3,
      link: '/reports',
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['Manager', 'Auditor']
    },
    {
      title: 'Administração',
      description: 'Painel administrativo do sistema',
      icon: Settings,
      link: '/admin',
      color: 'bg-red-500 hover:bg-red-600',
      roles: ['Admin']
    }
  ];

  const statCards = [
    {
      title: 'Total de Cotações',
      value: stats.totalQuotes,
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Propostas Pendentes',
      value: stats.pendingProposals,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Propostas Concluídas',
      value: stats.completedProposals,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo de volta, {user?.username}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button onClick={logout} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* User Info Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Informações do Usuário</CardTitle>
                <CardDescription className="text-blue-100">
                  Seus dados e permissões no sistema
                </CardDescription>
              </div>
              <Shield className="h-8 w-8 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
                <div className="flex items-center mt-2">
                  <span className="text-gray-600 mr-2">Funções:</span>
                  {user?.roles ? (
                    <div className="flex space-x-2">
                      {user.roles.map((role, index) => (
                        <Badge key={index} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="outline">Carregando...</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Último acesso</p>
                <p className="text-sm font-medium">Hoje, 14:30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesse rapidamente as principais funcionalidades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions
                    .filter(action => hasRole(action.roles))
                    .map((action, index) => (
                      <Link key={index} to={action.link}>
                        <Card className="hover:shadow-md transition-all duration-200 transform hover:scale-105 cursor-pointer border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-lg ${action.color} text-white`}>
                                <action.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimas ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'quote' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {activity.type === 'quote' ? (
                            <Calculator className={`h-4 w-4 ${
                              activity.type === 'quote' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          ) : (
                            <FileText className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <Button variant="outline" className="w-full">
                  Ver Todas as Atividades
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

