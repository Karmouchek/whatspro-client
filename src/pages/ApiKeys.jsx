// API Keys Management - Display all APIs with status, credits, and validity
import { useState, useEffect } from 'react';
import {
    Key, Check, X, AlertTriangle, Clock, RefreshCw,
    DollarSign, Calendar, ExternalLink, Copy, Eye, EyeOff,
    Zap, Bot, Phone, Globe, CreditCard, Mic, Video, Brain
} from 'lucide-react';
import api from '../services/api';

// API Status Badge
const StatusBadge = ({ status }) => {
    const statusConfig = {
        active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check, label: 'Active' },
        expired: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: X, label: 'Expired' },
        warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle, label: 'Low Credits' },
        inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: X, label: 'Not Configured' },
        free: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Zap, label: 'Free' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

// API Card Component
const ApiCard = ({ api: apiData, onRefresh }) => {
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (apiData.apiKey) {
            navigator.clipboard.writeText(apiData.apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const maskKey = (key) => {
        if (!key) return '••••••••••••••••';
        return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysRemaining = (expiryDate) => {
        if (!expiryDate) return null;
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysRemaining = getDaysRemaining(apiData.expiresAt);
    const IconComponent = apiData.icon || Key;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-violet-500/50 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${apiData.gradient || 'from-violet-500 to-purple-600'}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{apiData.name}</h3>
                        <p className="text-sm text-gray-400">{apiData.provider}</p>
                    </div>
                </div>
                <StatusBadge status={apiData.status} />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4">{apiData.description}</p>

            {/* API Key Display */}
            {apiData.hasKey && (
                <div className="bg-gray-900 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-500" />
                            <code className="text-sm text-gray-300 font-mono">
                                {showKey ? apiData.apiKey : maskKey(apiData.apiKey)}
                            </code>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                                title={showKey ? 'Hide' : 'Show'}
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className={`p-1.5 transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                                title="Copy"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Credits */}
                {apiData.credits !== undefined && (
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <DollarSign className="w-3 h-3" />
                            Credits
                        </div>
                        <p className={`text-lg font-bold ${apiData.credits <= 0 ? 'text-red-400' :
                            apiData.credits < apiData.lowCreditThreshold ? 'text-yellow-400' :
                                'text-white'
                            }`}>
                            {apiData.credits?.toLocaleString() || '0'} {apiData.creditUnit || ''}
                        </p>
                    </div>
                )}

                {/* Balance for paid APIs */}
                {apiData.balance !== undefined && (
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <CreditCard className="w-3 h-3" />
                            Balance
                        </div>
                        <p className={`text-lg font-bold ${apiData.balance <= 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                            {apiData.currency}{apiData.balance?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                )}

                {/* Validity */}
                {apiData.validFrom && (
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Calendar className="w-3 h-3" />
                            Valid From
                        </div>
                        <p className="text-sm font-medium text-white">{formatDate(apiData.validFrom)}</p>
                    </div>
                )}

                {/* Expiration */}
                {apiData.expiresAt && (
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            Expires
                        </div>
                        <p className={`text-sm font-medium ${daysRemaining !== null && daysRemaining <= 7 ? 'text-red-400' :
                            daysRemaining !== null && daysRemaining <= 30 ? 'text-yellow-400' :
                                'text-white'
                            }`}>
                            {formatDate(apiData.expiresAt)}
                            {daysRemaining !== null && daysRemaining > 0 && (
                                <span className="text-xs text-gray-400 ml-1">({daysRemaining}d left)</span>
                            )}
                        </p>
                    </div>
                )}

                {/* Usage */}
                {apiData.usage !== undefined && (
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Zap className="w-3 h-3" />
                            Usage
                        </div>
                        <p className="text-sm font-medium text-white">
                            {apiData.usage?.toLocaleString() || 0} / {apiData.usageLimit?.toLocaleString() || '∞'}
                        </p>
                    </div>
                )}

                {/* Free/Paid indicator */}
                <div className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <DollarSign className="w-3 h-3" />
                        Type
                    </div>
                    <p className={`text-sm font-bold ${apiData.isPaid ? 'text-orange-400' : 'text-green-400'}`}>
                        {apiData.isPaid ? '💰 Paid' : '🆓 Free'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
                {apiData.docsUrl && (
                    <a
                        href={apiData.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Docs
                    </a>
                )}
            </div>
        </div>
    );
};

export default function ApiKeys() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadApiStatus();
    }, []);

    const loadApiStatus = async () => {
        setLoading(true);
        try {
            // Fetch status from various API endpoints
            const results = await Promise.allSettled([
                api.get('/ai/status'),
                api.get('/numbers/balance'),
                api.get('/advanced-ai/status'),
                api.get('/settings/api-keys')
            ]);

            const aiStatus = results[0].status === 'fulfilled' ? results[0].value.data : {};
            const numbersBalance = results[1].status === 'fulfilled' ? results[1].value.data : {};
            const advancedStatus = results[2].status === 'fulfilled' ? results[2].value.data : {};
            const savedKeys = results[3].status === 'fulfilled' ? results[3].value.data : {};

            // Build API list
            const apiList = [
                // Claude (Anthropic)
                {
                    id: 'claude',
                    name: 'Claude AI',
                    provider: 'Anthropic',
                    description: 'Claude 3.5 Sonnet for AI responses, analysis, and more',
                    icon: Brain,
                    gradient: 'from-orange-500 to-amber-600',
                    status: aiStatus.initialized ? 'active' : 'inactive',
                    hasKey: true,
                    apiKey: savedKeys.anthropic || savedKeys.claude,
                    isPaid: true,
                    docsUrl: 'https://docs.anthropic.com'
                },
                // 5SIM
                {
                    id: '5sim',
                    name: '5SIM',
                    provider: '5SIM.net',
                    description: 'Virtual phone numbers for WhatsApp verification',
                    icon: Phone,
                    gradient: 'from-blue-500 to-cyan-600',
                    status: numbersBalance.balances?.find(b => b.provider === '5sim')?.balance > 0 ? 'active' : 'warning',
                    hasKey: true,
                    apiKey: savedKeys.fivesim,
                    isPaid: true,
                    balance: numbersBalance.balances?.find(b => b.provider === '5sim')?.balance || 0,
                    currency: '₽',
                    docsUrl: 'https://5sim.net/docs'
                },
                // SMSPVA
                {
                    id: 'smspva',
                    name: 'SMSPVA',
                    provider: 'smspva.com',
                    description: 'Virtual phone numbers for SMS verification',
                    icon: Phone,
                    gradient: 'from-purple-500 to-pink-600',
                    status: numbersBalance.balances?.find(b => b.provider === 'smspva')?.balance > 0 ? 'active' : 'warning',
                    hasKey: true,
                    apiKey: savedKeys.smspva,
                    isPaid: true,
                    balance: numbersBalance.balances?.find(b => b.provider === 'smspva')?.balance || 0,
                    currency: '$',
                    docsUrl: 'https://smspva.com/api.html'
                },
                // GrizzlySMS
                {
                    id: 'grizzlysms',
                    name: 'GrizzlySMS',
                    provider: 'grizzlysms.com',
                    description: 'Alternative virtual numbers provider',
                    icon: Phone,
                    gradient: 'from-orange-500 to-red-600',
                    status: numbersBalance.balances?.find(b => b.provider === 'grizzlysms')?.balance > 0 ? 'active' : 'warning',
                    hasKey: true,
                    apiKey: savedKeys.grizzlysms,
                    isPaid: true,
                    balance: numbersBalance.balances?.find(b => b.provider === 'grizzlysms')?.balance || 0,
                    currency: '$',
                    docsUrl: 'https://grizzlysms.com/api'
                },
                // ElevenLabs
                {
                    id: 'elevenlabs',
                    name: 'ElevenLabs',
                    provider: 'ElevenLabs',
                    description: 'Voice cloning and text-to-speech',
                    icon: Mic,
                    gradient: 'from-pink-500 to-rose-600',
                    status: advancedStatus.services?.voiceCloning?.initialized ? 'active' : 'inactive',
                    hasKey: true,
                    apiKey: savedKeys.elevenlabs,
                    isPaid: true,
                    docsUrl: 'https://elevenlabs.io/docs'
                },
                // HeyGen
                {
                    id: 'heygen',
                    name: 'HeyGen',
                    provider: 'HeyGen',
                    description: 'AI video avatar generation',
                    icon: Video,
                    gradient: 'from-indigo-500 to-purple-600',
                    status: advancedStatus.services?.videoAvatar?.initialized ? 'active' : 'inactive',
                    hasKey: true,
                    apiKey: savedKeys.heygen,
                    isPaid: true,
                    docsUrl: 'https://docs.heygen.com'
                },
                // Twilio
                {
                    id: 'twilio',
                    name: 'Twilio',
                    provider: 'Twilio',
                    description: 'Voice calls and AI phone agent',
                    icon: Phone,
                    gradient: 'from-red-500 to-pink-600',
                    status: advancedStatus.services?.aiPhoneAgent?.initialized ? 'active' : 'inactive',
                    hasKey: true,
                    apiKey: savedKeys.twilio,
                    isPaid: true,
                    docsUrl: 'https://www.twilio.com/docs'
                },
                // Google Translate API
                {
                    id: 'google_translate',
                    name: 'Google Translate',
                    provider: 'Google Cloud',
                    description: 'Real-time message translation',
                    icon: Globe,
                    gradient: 'from-blue-500 to-green-500',
                    status: advancedStatus.services?.realtimeTranslator?.initialized ? 'active' : 'free',
                    hasKey: false,
                    isPaid: false,
                    docsUrl: 'https://cloud.google.com/translate/docs'
                },
                // Webshare Proxies
                {
                    id: 'webshare',
                    name: 'Webshare Proxies',
                    provider: 'Webshare.io',
                    description: 'Residential proxies for WhatsApp connections',
                    icon: Globe,
                    gradient: 'from-cyan-500 to-blue-600',
                    status: savedKeys.webshare ? 'active' : 'inactive',
                    hasKey: true,
                    apiKey: savedKeys.webshare,
                    isPaid: true,
                    docsUrl: 'https://proxy.webshare.io/docs'
                },
                // WhatsApp Web.js (Free)
                {
                    id: 'whatsapp_webjs',
                    name: 'WhatsApp Web.js',
                    provider: 'Open Source',
                    description: 'WhatsApp Web automation library',
                    icon: Phone,
                    gradient: 'from-green-500 to-green-600',
                    status: 'free',
                    hasKey: false,
                    isPaid: false,
                    docsUrl: 'https://wwebjs.dev'
                }
            ];

            setApis(apiList);
        } catch (error) {
            console.error('Failed to load API status:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshApi = async () => {
        setRefreshing(true);
        await loadApiStatus();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading API status...</p>
                </div>
            </div>
        );
    }

    const activeApis = apis.filter(a => a.status === 'active' || a.status === 'free');
    const warningApis = apis.filter(a => a.status === 'warning');
    const inactiveApis = apis.filter(a => a.status === 'inactive' || a.status === 'expired');

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Key className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                API Keys
                            </h1>
                            <p className="text-gray-400">Manage all your API integrations and credits</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadApiStatus()}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh All
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{activeApis.length}</p>
                                <p className="text-xs text-gray-400">Active APIs</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{warningApis.length}</p>
                                <p className="text-xs text-gray-400">Low Credits</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <X className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{inactiveApis.length}</p>
                                <p className="text-xs text-gray-400">Not Configured</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                <Key className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{apis.length}</p>
                                <p className="text-xs text-gray-400">Total APIs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* APIs Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apis.map(apiData => (
                        <ApiCard
                            key={apiData.id}
                            api={apiData}
                            onRefresh={() => refreshApi(apiData.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
