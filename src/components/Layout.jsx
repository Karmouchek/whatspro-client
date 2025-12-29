import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Send, Settings, LogOut, Users, Shield, Smartphone, Bot, CreditCard, Zap, Menu, X, ChevronLeft, ChevronRight, Key, Activity, FileText } from 'lucide-react';
import { agents, whatsapp } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Initialize agent info from localStorage (not in effect to avoid cascading renders)
  const [agentInfo] = useState(() => {
    return JSON.parse(localStorage.getItem('agent') || '{}');
  });

  // Update agent online status on mount/unmount
  useEffect(() => {
    agents.updateStatus(true).catch(console.error);
    return () => { agents.updateStatus(false).catch(console.error); };
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  const { data: whatsappData } = useQuery({
    queryKey: ['whatsapp-sessions-menu'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
    refetchInterval: 15000,
  });

  const connectedSessions = whatsappData?.sessions?.filter(s => s.status === 'connected') || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    navigate('/login');
  };

  const isSuperAdmin = agentInfo?.role === 'super_admin';

  // Build menu based on role
  const menuItems = [];

  if (isSuperAdmin) {
    // SUPER ADMIN MENU - Full access
    menuItems.push(
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/settings', icon: Settings, label: 'Settings' },
      { path: '/admin', icon: Shield, label: 'Admin' },
      { path: '/api-keys', icon: Key, label: 'API Keys' },
      { path: '/client-logs', icon: Activity, label: 'Logs' },
      { path: '/send-message', icon: Send, label: 'Send' },
      { path: '/campaigns', icon: Users, label: 'Campaigns' },
      { path: '/scripts', icon: FileText, label: 'Scripts' },
      { path: '/virtual-numbers', icon: CreditCard, label: 'Numbers' },
      { path: '/me-ia', icon: Bot, label: 'Me IA' },
      { path: '/whatsapp', icon: Smartphone, label: 'WhatsApp' }
    );
  } else {
    // CLIENT MENU - Simplified (WhatsApp, Send, Settings only)
    // Clients can have max 5 WhatsApp sessions
    menuItems.push(
      { path: '/whatsapp', icon: Smartphone, label: 'WhatsApp' },
      { path: '/send-message', icon: Send, label: 'Send' },
      { path: '/settings', icon: Settings, label: 'Settings' }
    );
  }

  // Chats - appear after main menu, show connected sessions
  if (connectedSessions.length > 0) {
    // For clients, limit to max 5 sessions
    const maxSessions = isSuperAdmin ? connectedSessions.length : Math.min(connectedSessions.length, 5);
    connectedSessions.slice(0, maxSessions).forEach(session => {
      menuItems.push({
        path: `/chats?session=${session.sessionId}`,
        icon: MessageSquare,
        label: 'Chats',
        sessionName: session.name,
        sessionId: session.sessionId
      });
    });
  } else {
    menuItems.push({ path: '/chats', icon: MessageSquare, label: 'Chats' });
  }

  // No filtering needed - menu is already role-based
  const filteredMenuItems = menuItems;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-white hover:bg-gray-700 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-1.5 rounded-lg">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">WhatsApp</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        ${collapsed ? 'w-16' : 'w-56'} 
        bg-gray-800 border-r border-gray-700 flex flex-col
        transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Toggle */}
        <div className={`px-3 py-3 border-b border-gray-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-1.5 rounded-lg flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate">WhatsApp</h1>
                {agentInfo?.name && (
                  <p className="text-[10px] text-emerald-400 truncate">{agentInfo.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          <div className="space-y-0.5">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path.split('?')[0] &&
                (!item.sessionId || location.search.includes(item.sessionId));
              return (
                <Link
                  key={item.sessionId ? `${item.path}-${item.sessionId}` : item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} 
                    ${collapsed ? 'px-2 py-2.5' : 'px-3 py-2'} rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-[13px] truncate">{item.label}</span>
                      {item.sessionName && (
                        <span className="text-emerald-400 text-[10px] truncate max-w-[50px]">{item.sessionName}</span>
                      )}
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={`px-2 py-2 border-t border-gray-700 bg-gray-900 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              flex items-center justify-center gap-2 rounded-lg 
              bg-red-600 hover:bg-red-500 text-white font-semibold
              transition-all shadow-md
              ${collapsed ? 'p-2.5' : 'px-3 py-2 w-full text-sm'}
            `}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && <p className="mt-2 text-center text-[9px] text-gray-500">v2.0</p>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-900 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

Layout.propTypes = { children: PropTypes.node };
