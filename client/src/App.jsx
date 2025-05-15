import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CampaignList from './components/CampaignList';
import CampaignForm from './components/CampaignForm';
import CampaignDetails from './components/CampaignDetails';
import Login from './components/Login';
import Register from './components/Register';
import LoginPortal from './components/LoginPortal';
import WarningPage from './components/WarningPage';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.css';

const router = {
  future: {
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <BrowserRouter future={router}>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/portal/:campaignId/:userId" element={<LoginPortal />} />
              <Route path="/youve-been-phished" element={<WarningPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <PrivateRoute>
                    <CampaignList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns/new"
                element={
                  <PrivateRoute>
                    <CampaignForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns/:id"
                element={
                  <PrivateRoute>
                    <CampaignDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns/:id/edit"
                element={
                  <PrivateRoute>
                    <CampaignForm isEditing />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 