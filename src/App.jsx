import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Auth from "./components/Auth";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import BalancePage from "./pages/balance/BalancePage";
import Layout from "./components/Layout";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/balance"
            element={
              <ProtectedRoute>
                <BalancePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
