import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Users, Globe, TrendingUp, Clock, Zap, Activity,
  Phone, Bot, Sparkles, ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertTriangle, Wifi, WifiOff, Calendar, Target, BarChart3, PieChart,
  MessageCircle, UserCheck, Settings, ChevronRight, Bell, Shield
} from 'lucide-react';
import { analytics, whatsapp, ai } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useTranslation } from '../hooks/useTranslation';

export default function Dashboard() {
  const t = useTranslation();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analytics.getDashboard().then(res => res.data),
  });

  const { data: timeline } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => analytics.getTimeline(7).then(res => res.data),
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => analytics.getCountries().then(res => res.data),
  });

  const { data: whatsappData } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => ai.getStatus().then(res => res.data),
  });

  const sessions = whatsappData?.sessions || [];
  const whatsappStats = whatsappData?.stats || {};
  const connectedSessions = sessions.filter(s => s.status === 'connected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const mainStats = [
    {
      label: 'WhatsApp Connected',
      value: connectedSessions.length,
      total: sessions.length,
      icon: Phone,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      trend: connectedSessions.length > 0 ? 'up' : 'neutral',
      link: '/whatsapp'
    },
    {
      label: 'Messages Today',
      value: stats?.messagesToday || 0,
      icon: Send,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      change: '+12%',
      trend: 'up',
      link: '/chats'
    },
    {
      label: 'Active Conversations',
      value: stats?.activeConversations || 0,
      icon: MessageSquare,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/20 to-purple-500/20',
      change: '+8%',
      trend: 'up',
      link: '/inbox'
    },
    {
      label: 'AI Status',
      value: aiStatus?.initialized ? 'Active' : 'Inactive',
      icon: Bot,
      gradient: aiStatus?.initialized ? 'from-pink-500 to-rose-500' : 'from-gray-500 to-gray-600',
      bgGradient: aiStatus?.initialized ? 'from-pink-500/20 to-rose-500/20' : 'from-gray-500/20 to-gray-600/20',
      trend: aiStatus?.initialized ? 'up' : 'neutral',
      link: '/ai'
    },
  ];

  return (
    <div className="p-6 lg:p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-400 mt-2">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${connectedSessions.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-300">
              {connectedSessions.length} WhatsApp Active
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 bg-gray-800 rounded-xl border border-gray-700 hover:border-violet-500/50 transition-all"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(stat.link)}
              className="group relative bg-gray-800 rounded-2xl border border-gray-700 p-5 
                         hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 
                         transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.change && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-400 bg-green-500/20' :
                      stat.trend === 'down' ? 'text-red-400 bg-red-500/20' :
                        'text-gray-400 bg-gray-500/20'
                      }`}>
                      {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  )}
                  {stat.total !== undefined && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-gray-400 bg-gray-700">
                      {stat.value}/{stat.total}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>

              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Grid - Important metrics at a glance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={Send}
          label="Total Sent"
          value={stats?.messagesSent || 0}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={MessageCircle}
          label="Total Received"
          value={stats?.messagesReceived || 0}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Users}
          label="Total Agents"
          value={stats?.totalAgents || 0}
          gradient="from-violet-500 to-purple-500"
        />
        <StatCard
          icon={UserCheck}
          label="Online Agents"
          value={stats?.onlineAgents || 0}
          gradient="from-pink-500 to-rose-500"
        />
        <StatCard
          icon={Globe}
          label="Countries"
          value={stats?.activeCountries || 0}
          gradient="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={stats?.totalConversations || 0}
          gradient="from-teal-500 to-cyan-500"
        />
      </div>

      {/* WhatsApp Sessions Status */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-400" />
            WhatsApp Sessions
          </h2>
          <button
            onClick={() => navigate('/whatsapp')}
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Manage <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No WhatsApp sessions configured</p>
            <button
              onClick={() => navigate('/whatsapp')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Connect WhatsApp
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sessions.slice(0, 8).map((session) => (
              <div
                key={session.sessionId}
                className={`p-4 rounded-xl border transition-all ${session.status === 'connected'
                  ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                  : session.status === 'connecting'
                    ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.status === 'connected' ? 'bg-green-500/20' :
                    session.status === 'connecting' ? 'bg-yellow-500/20' : 'bg-gray-600'
                    }`}>
                    {session.status === 'connected' ? (
                      <Wifi className="w-5 h-5 text-green-400" />
                    ) : session.status === 'connecting' ? (
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{session.name}</p>
                    <p className="text-xs text-gray-400">
                      {session.phoneNumber ? `+${session.phoneNumber}` : session.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Session Stats Bar */}
        {sessions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-400">Connected: {whatsappStats.connected || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-400">Connecting: {whatsappStats.connecting || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-400">Disconnected: {whatsappStats.disconnected || 0}</span>
            </div>
            <div className="ml-auto text-sm text-gray-500">
              Capacity: {whatsappStats.total || 0}/{whatsappStats.maxAllowed || 30}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Right after WhatsApp Sessions */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <QuickAction icon={Phone} label="WhatsApp" onClick={() => navigate('/whatsapp')} color="green" />
          <QuickAction icon={MessageSquare} label="Chats" onClick={() => navigate('/chats')} color="blue" />
          <QuickAction icon={Send} label="Send Message" onClick={() => navigate('/send-message')} color="cyan" />
          <QuickAction icon={Bot} label="AI Config" onClick={() => navigate('/ai')} color="purple" />
          <QuickAction icon={Sparkles} label="Advanced AI" onClick={() => navigate('/advanced-ai')} color="pink" />
          <QuickAction icon={Settings} label="Settings" onClick={() => navigate('/settings')} color="gray" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Timeline */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Messages (7 Days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeline || []}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Area type="monotone" dataKey="sent" stroke="#22c55e" fill="url(#sentGradient)" name="Sent" />
              <Area type="monotone" dataKey="received" stroke="#3b82f6" fill="url(#receivedGradient)" name="Received" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Countries */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Top Countries
            </h2>
          </div>
          <div className="space-y-3">
            {countries?.slice(0, 5).map((country, index) => {
              const maxConversations = countries[0]?.total_conversations || 1;
              const percentage = (country.total_conversations / maxConversations) * 100;
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag || '🌍'}</span>
                      <span className="text-sm font-medium text-white">{country.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">{country.total_conversations}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all group-hover:from-violet-400 group-hover:to-purple-400"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {(!countries || countries.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No country data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
// eslint-disable-next-line no-unused-vars
function StatCard({ icon: IconComponent, label, value, gradient }) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-2`}>
        <IconComponent className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

// Quick Action Component
// eslint-disable-next-line no-unused-vars
function QuickAction({ icon: IconComponent, label, onClick, color }) {
  const colors = {
    green: 'hover:bg-green-500/20 hover:border-green-500/50 text-green-400',
    blue: 'hover:bg-blue-500/20 hover:border-blue-500/50 text-blue-400',
    cyan: 'hover:bg-cyan-500/20 hover:border-cyan-500/50 text-cyan-400',
    purple: 'hover:bg-purple-500/20 hover:border-purple-500/50 text-purple-400',
    pink: 'hover:bg-pink-500/20 hover:border-pink-500/50 text-pink-400',
    gray: 'hover:bg-gray-500/20 hover:border-gray-500/50 text-gray-400',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 transition-all ${colors[color]}`}
    >
      <IconComponent className="w-6 h-6" />
      <span className="text-xs font-medium text-gray-300">{label}</span>
    </button>
  );
}
