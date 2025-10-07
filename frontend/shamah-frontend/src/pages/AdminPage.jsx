import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PlusCircle, Edit, Trash2, User, Building, Package, Scale } from 'lucide-react';

const AdminPage = () => {
  const { authToken, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [insurers, setInsurers] = useState([]);
  const [merchandiseTypes, setMerchandiseTypes] = useState([]);
  const [businessRules, setBusinessRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for forms (simplified for example)
  const [newInsurerName, setNewInsurerName] = useState('');
  const [newMerchandiseTypeName, setNewMerchandiseTypeName] = useState('');
  const [newMerchandiseTypeRiskLevel, setNewMerchandiseTypeRiskLevel] = useState(1);

  useEffect(() => {
    fetchData();
  }, [authToken, hasRole]);

  const fetchData = async () => {
    if (!authToken || !hasRole(['Admin'])) {
      setError('Você não tem permissão para acessar esta página.');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${authToken.access}`,
      };

      const [usersRes, insurersRes, merchandiseRes, rulesRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/users/users/', { headers }),
        fetch('http://localhost:8000/api/v1/insurers/insurers/', { headers }),
        fetch('http://localhost:8000/api/v1/insurers/merchandise-types/', { headers }),
        fetch('http://localhost:8000/api/v1/insurers/business-rules/', { headers }),
      ]);

      if (!usersRes.ok) throw new Error(`HTTP error! Users status: ${usersRes.status}`);
      if (!insurersRes.ok) throw new Error(`HTTP error! Insurers status: ${insurersRes.status}`);
      if (!merchandiseRes.ok) throw new Error(`HTTP error! Merchandise Types status: ${merchandiseRes.status}`);
      if (!rulesRes.ok) throw new Error(`HTTP error! Business Rules status: ${rulesRes.status}`);

      setUsers(await usersRes.json());
      setInsurers(await insurersRes.json());
      setMerchandiseTypes(await merchandiseRes.json());
      setBusinessRules(await rulesRes.json());

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInsurer = async () => {
    // Validação no frontend
    if (!newInsurerName || newInsurerName.trim() === '') {
      alert('Erro: O campo "Nome da Seguradora" não pode ficar em branco.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/insurers/insurers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.access}`,
        },
        body: JSON.stringify({ name: newInsurerName.trim(), is_active: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      setNewInsurerName('');
      fetchData();
      alert('Seguradora adicionada com sucesso!');
    } catch (error) {
      alert(`Erro ao adicionar seguradora: ${error.message}`);
    }
  };

  const handleDeleteInsurer = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta seguradora?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/insurers/insurers/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchData();
    } catch (error) {
      alert(`Erro ao excluir seguradora: ${error.message}`);
    }
  };

  const handleAddMerchandiseType = async () => {
    // Validação no frontend
    if (!newMerchandiseTypeName || newMerchandiseTypeName.trim() === '') {
      alert('Erro: O campo "Nome do Tipo de Mercadoria" não pode ficar em branco.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/insurers/merchandise-types/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.access}`,
        },
        body: JSON.stringify({ name: newMerchandiseTypeName.trim(), risk_level: newMerchandiseTypeRiskLevel }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      setNewMerchandiseTypeName('');
      setNewMerchandiseTypeRiskLevel(1);
      fetchData();
      alert('Tipo de mercadoria adicionado com sucesso!');
    } catch (error) {
      alert(`Erro ao adicionar tipo de mercadoria: ${error.message}`);
    }
  };

  const handleDeleteMerchandiseType = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de mercadoria?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/insurers/merchandise-types/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken.access}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchData();
    } catch (error) {
      alert(`Erro ao excluir tipo de mercadoria: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando dados administrativos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl">Painel Administrativo</CardTitle>
          <CardDescription className="text-blue-100">Gerencie usuários, seguradoras, tipos de mercadoria e regras de negócio.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center"><User className="mr-2" /> Usuários</TabsTrigger>
              <TabsTrigger value="insurers" className="flex items-center"><Building className="mr-2" /> Seguradoras</TabsTrigger>
              <TabsTrigger value="merchandise" className="flex items-center"><Package className="mr-2" /> Mercadorias</TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center"><Scale className="mr-2" /> Regras de Negócio</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Gerenciar Usuários</h2>
              {users.length === 0 ? (
                <p>Nenhum usuário encontrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{(user.groups || []).map(group => group.name).join(', ')}</TableCell>
                        <TableCell>{user.is_active ? 'Sim' : 'Não'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2"><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="insurers" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Gerenciar Seguradoras</h2>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Nome da nova seguradora"
                  value={newInsurerName}
                  onChange={(e) => setNewInsurerName(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleAddInsurer}><PlusCircle className="mr-2" /> Adicionar</Button>
              </div>
              {insurers.length === 0 ? (
                <p>Nenhuma seguradora encontrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ativa</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insurers.map(insurer => (
                      <TableRow key={insurer.id}>
                        <TableCell>{insurer.id}</TableCell>
                        <TableCell>{insurer.name}</TableCell>
                        <TableCell>{insurer.is_active ? 'Sim' : 'Não'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2"><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteInsurer(insurer.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="merchandise" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Gerenciar Tipos de Mercadoria</h2>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Nome do novo tipo de mercadoria"
                  value={newMerchandiseTypeName}
                  onChange={(e) => setNewMerchandiseTypeName(e.target.value)}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  placeholder="Nível de Risco (1-5)"
                  value={newMerchandiseTypeRiskLevel}
                  onChange={(e) => setNewMerchandiseTypeRiskLevel(parseInt(e.target.value))}
                  className="w-32"
                  min="1"
                  max="5"
                />
                <Button onClick={handleAddMerchandiseType}><PlusCircle className="mr-2" /> Adicionar</Button>
              </div>
              {merchandiseTypes.length === 0 ? (
                <p>Nenhum tipo de mercadoria encontrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Nível de Risco</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchandiseTypes.map(type => (
                      <TableRow key={type.id}>
                        <TableCell>{type.id}</TableCell>
                        <TableCell>{type.name}</TableCell>
                        <TableCell>{type.risk_level}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2"><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteMerchandiseType(type.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="rules" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Gerenciar Regras de Negócio das Seguradoras</h2>
              {businessRules.length === 0 ? (
                <p>Nenhuma regra de negócio encontrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Seguradora</TableHead>
                      <TableHead>Tipo Mercadoria</TableHead>
                      <TableHead>RCTR-C Taxa</TableHead>
                      <TableHead>RC-DC Taxa</TableHead>
                      <TableHead>Ativa</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessRules.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.id}</TableCell>
                        <TableCell>{rule.insurer_name}</TableCell>
                        <TableCell>{rule.merchandise_type_name}</TableCell>
                        <TableCell>{rule.rctr_c_rate}</TableCell>
                        <TableCell>{rule.rc_dc_rate}</TableCell>
                        <TableCell>{rule.is_active ? 'Sim' : 'Não'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2"><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;


