import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chats from './pages/Chats';
import Campaigns from './pages/Campaigns';
import SendMessage from './pages/SendMessage';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import WhatsApp from './pages/WhatsApp';
import MeIA from './pages/MeIA';
import AdvancedAI from './pages/AdvancedAI';
import VirtualNumbers from './pages/VirtualNumbers';
import ApiKeys from './pages/ApiKeys';
import ClientLogs from './pages/ClientLogs';
import Scripts from './pages/Scripts';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const agent = JSON.parse(localStorage.getItem('agent') || '{}');
  const isSuperAdmin = agent.role === 'super_admin';

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {isAuthenticated ? (
            <>
              {/* Redirect root based on role */}
              <Route path="/" element={<Navigate to={isSuperAdmin ? "/dashboard" : "/inbox"} replace />} />

              {/* SUPER ADMIN ONLY ROUTES */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><Admin /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/api-keys" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><ApiKeys /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/client-logs" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><ClientLogs /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/virtual-numbers" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><VirtualNumbers /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/me-ia" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><MeIA /></Layout>
                </ProtectedRoute>
              } />
              {/* Keep advanced-ai for feature panels */}
              <Route path="/advanced-ai" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><AdvancedAI /></Layout>
                </ProtectedRoute>
              } />
              {/* Redirect old /ai to /me-ia */}
              <Route path="/ai" element={<Navigate to="/me-ia" replace />} />
              {/* Campaigns - Super Admin only */}
              <Route path="/campaigns" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><Campaigns /></Layout>
                </ProtectedRoute>
              } />
              {/* Scripts - Super Admin only */}
              <Route path="/scripts" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <Layout><Scripts /></Layout>
                </ProtectedRoute>
              } />

              {/* CLIENT ACCESSIBLE ROUTES - Only these 4: WhatsApp, Send, Settings, Chats */}
              <Route path="/chats" element={<Layout><Chats /></Layout>} />
              <Route path="/send-message" element={<Layout><SendMessage /></Layout>} />
              <Route path="/whatsapp" element={<Layout><WhatsApp /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
