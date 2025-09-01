import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo, {user?.username}!</h2>
        <p className="text-gray-700 mb-6">Seu papel: {user?.roles ? user.roles.join(', ') : 'Carregando...'}</p>

        <nav className="mb-6">
          <ul className="space-y-2">
            {hasRole(['Broker', 'Manager']) && (
              <li>
                <Link to="/quotes" className="text-blue-500 hover:underline">Gerenciar Cotações</Link>
              </li>
            )}
            {hasRole(['Broker', 'Manager', 'Auditor']) && (
              <li>
                <Link to="/proposals" className="text-blue-500 hover:underline">Visualizar Propostas</Link>
              </li>
            )}
            {hasRole(['Admin']) && (
              <li>
                <Link to="/admin" className="text-blue-500 hover:underline">Painel Administrativo</Link>
              </li>
            )}
          </ul>
        </nav>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;