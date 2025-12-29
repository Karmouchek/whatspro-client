// Client Logs - Monitor all client activities and flag dangerous sends
import { useState, useEffect } from 'react';
import {
    Users, AlertTriangle, CheckCircle, Clock, MessageSquare, Send,
    Eye, Search, Filter, RefreshCw, ChevronDown, ChevronRight,
    Phone, Mail, Calendar, TrendingUp, Shield, XCircle, Activity
} from 'lucide-react';
import api from '../services/api';

// Dangerous keywords/patterns to flag
const DANGEROUS_PATTERNS = [
    // Spam patterns
    'bitcoin', 'crypto', 'investment', 'forex', 'trading', 'make money fast',
    'get rich', 'lottery', 'winner', 'claim your prize', 'congratulations you won',
    // Phishing patterns
    'verify your account', 'click here immediately', 'urgent action required',
    'your account will be suspended', 'confirm your identity', 'update payment',
    // Scam patterns
    'wire transfer', 'western union', 'moneygram', 'gift card', 'itunes card',
    'google play card', 'amazon card', 'send money', 'bank transfer urgent',
    // Adult content
    'xxx', 'adult', 'naked', 'sexy', 'hot girls', 'dating site',
    // Violence/threats
    'kill', 'bomb', 'attack', 'threat', 'revenge',
    // French spam
    'crédit facile', 'argent facile', 'gagner de l\'argent', 'cliquez ici',
    'félicitations', 'vous avez gagné', 'urgent', 'offre limitée'
];

// Check if message contains dangerous content
const checkDangerousContent = (message) => {
    if (!message) return { isDangerous: false, reasons: [] };

    const lowerMessage = message.toLowerCase();
    const reasons = [];

    DANGEROUS_PATTERNS.forEach(pattern => {
        if (lowerMessage.includes(pattern.toLowerCase())) {
            reasons.push(pattern);
        }
    });

    // Check for excessive caps (shouting)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.5 && message.length > 20) {
        reasons.push('Excessive caps (shouting)');
    }

    // Check for excessive links
    const linkCount = (message.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
        reasons.push(`${linkCount} links detected`);
    }

    // Check for phone numbers (potential spam)
    const phoneCount = (message.match(/\+?\d{10,}/g) || []).length;
    if (phoneCount > 2) {
        reasons.push('Multiple phone numbers');
    }

    return {
        isDangerous: reasons.length > 0,
        reasons
    };
};

// Client Card Component
const ClientCard = ({ client, isExpanded, onToggle }) => {
    const hasDangerousActivity = client.dangerousCount > 0;

    return (
        <div className={`bg-gray-800 rounded-xl border ${hasDangerousActivity ? 'border-red-500/50' : 'border-gray-700'
            } overflow-hidden`}>
            {/* Header */}
            <div
                className={`p-4 cursor-pointer hover:bg-gray-700/50 transition-colors ${hasDangerousActivity ? 'bg-red-500/10' : ''
                    }`}
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${hasDangerousActivity
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                            }`}>
                            {client.name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                                {hasDangerousActivity && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                        <AlertTriangle className="w-3 h-3" />
                                        {client.dangerousCount} alertes
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{client.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Quick Stats */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">{client.totalMessages || 0}</p>
                                <p className="text-xs text-gray-400">Messages</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-400">{client.sessionsCount || 0}</p>
                                <p className="text-xs text-gray-400">Sessions</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-lg font-bold ${client.dangerousCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {client.dangerousCount || 0}
                                </p>
                                <p className="text-xs text-gray-400">Alertes</p>
                            </div>
                        </div>

                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                    {/* Activity Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <Send className="w-3 h-3" />
                                Total Envois
                            </div>
                            <p className="text-xl font-bold text-white">{client.totalMessages || 0}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <Phone className="w-3 h-3" />
                                Sessions WA
                            </div>
                            <p className="text-xl font-bold text-green-400">{client.sessionsCount || 0}/5</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <Calendar className="w-3 h-3" />
                                Dernière activité
                            </div>
                            <p className="text-sm font-medium text-white">
                                {client.lastActivity ? new Date(client.lastActivity).toLocaleString('fr-FR') : 'Jamais'}
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-xs mb-1 text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                Envois suspects
                            </div>
                            <p className={`text-xl font-bold ${client.dangerousCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {client.dangerousCount || 0}
                            </p>
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Messages récents
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {client.recentMessages?.length > 0 ? (
                                client.recentMessages.map((msg, idx) => {
                                    const dangerCheck = checkDangerousContent(msg.content);
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg ${dangerCheck.isDangerous
                                                ? 'bg-red-500/10 border border-red-500/30'
                                                : 'bg-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(msg.createdAt).toLocaleString('fr-FR')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">→</span>
                                                        <span className="text-xs text-gray-400 truncate">
                                                            {msg.recipient || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm ${dangerCheck.isDangerous ? 'text-red-300' : 'text-gray-300'} break-words`}>
                                                        {msg.content?.substring(0, 200)}
                                                        {msg.content?.length > 200 && '...'}
                                                    </p>
                                                    {dangerCheck.isDangerous && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {dangerCheck.reasons.map((reason, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                                                    {reason}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {dangerCheck.isDangerous && (
                                                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">Aucun message récent</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ClientLogs() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClient, setExpandedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDangerous, setFilterDangerous] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadClientLogs();
    }, []);

    const loadClientLogs = async () => {
        setLoading(true);
        try {
            // Fetch all agents (clients)
            const agentsRes = await api.get('/agents');
            const agents = agentsRes.data.filter(a => a.role !== 'super_admin');

            // For each agent, fetch their message logs
            const clientsWithLogs = await Promise.all(
                agents.map(async (agent) => {
                    try {
                        // Fetch messages sent by this agent
                        const logsRes = await api.get(`/logs/agent/${agent.id}`);
                        const messages = logsRes.data.logs || [];

                        // Count dangerous messages
                        let dangerousCount = 0;
                        messages.forEach(msg => {
                            const check = checkDangerousContent(msg.content);
                            if (check.isDangerous) dangerousCount++;
                        });

                        // Fetch their WhatsApp sessions count
                        const sessionsRes = await api.get(`/whatsapp/sessions?agentId=${agent.id}`);
                        const sessions = sessionsRes.data.sessions || [];

                        return {
                            ...agent,
                            totalMessages: messages.length,
                            recentMessages: messages.slice(0, 10),
                            dangerousCount,
                            sessionsCount: sessions.length,
                            lastActivity: messages[0]?.createdAt || null
                        };
                    } catch {
                        return {
                            ...agent,
                            totalMessages: 0,
                            recentMessages: [],
                            dangerousCount: 0,
                            sessionsCount: 0,
                            lastActivity: null
                        };
                    }
                })
            );

            // Sort by dangerous count (descending), then by last activity
            clientsWithLogs.sort((a, b) => {
                if (b.dangerousCount !== a.dangerousCount) {
                    return b.dangerousCount - a.dangerousCount;
                }
                return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
            });

            setClients(clientsWithLogs);
        } catch (error) {
            console.error('Failed to load client logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadClientLogs();
        setRefreshing(false);
    };

    // Filter clients
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDangerous = !filterDangerous || client.dangerousCount > 0;
        return matchesSearch && matchesDangerous;
    });

    // Stats
    const totalClients = clients.length;
    const totalMessages = clients.reduce((sum, c) => sum + c.totalMessages, 0);
    const totalDangerous = clients.reduce((sum, c) => sum + c.dangerousCount, 0);
    const clientsWithAlerts = clients.filter(c => c.dangerousCount > 0).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Chargement des logs clients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Logs Clients
                            </h1>
                            <p className="text-gray-400">Surveillance des activités et détection des envois dangereux</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalClients}</p>
                                <p className="text-xs text-gray-400">Clients</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalMessages.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Total Messages</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-400">{totalDangerous}</p>
                                <p className="text-xs text-gray-400">Envois suspects</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Shield className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-400">{clientsWithAlerts}</p>
                                <p className="text-xs text-gray-400">Clients avec alertes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un client..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setFilterDangerous(!filterDangerous)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filterDangerous
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Envois suspects seulement
                    </button>
                </div>
            </div>

            {/* Alert for dangerous activities */}
            {totalDangerous > 0 && (
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <div>
                            <p className="text-red-400 font-semibold">⚠️ Activités suspectes détectées</p>
                            <p className="text-red-300 text-sm">
                                {totalDangerous} message(s) suspect(s) détecté(s) chez {clientsWithAlerts} client(s).
                                Vérifiez les détails ci-dessous.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Clients List */}
            <div className="max-w-7xl mx-auto space-y-4">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            isExpanded={expandedClient === client.id}
                            onToggle={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Aucun client trouvé</h3>
                        <p className="text-gray-400">
                            {searchTerm || filterDangerous
                                ? 'Essayez de modifier vos filtres'
                                : 'Les clients apparaîtront ici une fois créés'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
