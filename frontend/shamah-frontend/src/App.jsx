
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
          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminPage /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;


