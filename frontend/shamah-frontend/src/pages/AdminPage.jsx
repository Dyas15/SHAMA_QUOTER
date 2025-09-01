// frontend/shamah-frontend/src/pages/AdminPage.jsx (Versão corrigida)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { authToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [insurers, setInsurers] = useState([]);
  const [merchandiseTypes, setMerchandiseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Users
        const usersResponse = await fetch('http://localhost:8000/api/v1/users/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status}`);
        const usersData = await usersResponse.json();
        setUsers(usersData);
        const insurersResponse = await fetch('http://localhost:8000/api/v1/insurers/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!insurersResponse.ok) throw new Error(`HTTP error! status: ${insurersResponse.status}`);
        const insurersData = await insurersResponse.json();
        setInsurers(insurersData);

        // Fetch Merchandise Types
        // Esta URL provavelmente está correta, pois "merchandise-types" é um recurso DENTRO de "insurers".
        const merchandiseTypesResponse = await fetch('http://localhost:8000/api/v1/insurers/merchandise-types/', {
          headers: {
            'Authorization': `Bearer ${authToken.access}`,
          },
        });
        if (!merchandiseTypesResponse.ok) throw new Error(`HTTP error! status: ${merchandiseTypesResponse.status}`);
        const merchandiseTypesData = await merchandiseTypesResponse.json();
        setMerchandiseTypes(merchandiseTypesData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  if (loading) return <div className="text-center py-8">Carregando dados administrativos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Painel Administrativo</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Usuários</h2>
        {users.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <ul className="list-disc pl-5">
            {users.map(user => (
              <li key={user.id}>{user.username} ({user.email})</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Seguradoras</h2>
        {insurers.length === 0 ? (
          <p>Nenhuma seguradora encontrada.</p>
        ) : (
          <ul className="list-disc pl-5">
            {insurers.map(insurer => (
              <li key={insurer.id}>{insurer.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Tipos de Mercadoria</h2>
        {merchandiseTypes.length === 0 ? (
          <p>Nenhum tipo de mercadoria encontrado.</p>
        ) : (
          <ul className="list-disc pl-5">
            {merchandiseTypes.map(type => (
              <li key={type.id}>{type.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPage;