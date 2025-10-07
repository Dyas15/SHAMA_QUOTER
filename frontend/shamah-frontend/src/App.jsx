import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuoteRequestPage from './pages/QuoteRequestPage';
import ProposalPage from './pages/ProposalPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import ReportsPage from './pages/ReportsPage';
import AllActivitiesPage from './pages/AllActivitiesPage'; // Importar o novo componente
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/quotes" element={<PrivateRoute roles={['Broker', 'Manager']}><QuoteRequestPage /></PrivateRoute>} />
          <Route path="/proposals" element={<PrivateRoute roles={['Broker', 'Manager', 'Auditor']}><ProposalPage /></PrivateRoute>} />
          <Route path="/proposals/:id" element={<PrivateRoute roles={['Broker', 'Manager', 'Auditor']}><ProposalDetailPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['Manager', 'Auditor']}><ReportsPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminPage /></PrivateRoute>} />
          <Route path="/admin/activities" element={<PrivateRoute roles={['Admin', 'Manager', 'Auditor']}><AllActivitiesPage /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;


