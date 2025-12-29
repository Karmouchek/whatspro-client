// Me IA - Your AI Clone that acts on your behalf
// Combines AI Bot + Advanced AI + Secretary Mode
import { useState, useEffect } from 'react';
import {
    Bot, Brain, Mic, Settings, MessageSquare, Sparkles,
    User, Send, CheckCircle, XCircle, Zap, Shield,
    Target, TrendingUp, Users, Clock, Play, Pause,
    ChevronRight, Eye, Edit2, Save, Globe, Calendar,
    Phone, FileText, AlertTriangle, RefreshCw, Copy,
    Volume2, VolumeX, Clipboard, Check, ArrowRight,
    Briefcase, Heart, Star, Coffee, Moon, Sun
} from 'lucide-react';
import api from '../services/api';

// Tab Button Component
// eslint-disable-next-line no-unused-vars
const TabButton = ({ active, onClick, icon: Icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${active
            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        {badge && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {badge}
            </span>
        )}
    </button>
);

// Feature Card Component
// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ icon: Icon, title, description, status, onClick, color = 'violet' }) => {
    const colorClasses = {
        violet: 'from-violet-500 to-purple-600',
        cyan: 'from-cyan-500 to-blue-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-red-600',
        pink: 'from-pink-500 to-rose-600'
    };

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 cursor-pointer hover:border-violet-500/50 transition-all group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${status === 'active' ? 'bg-green-500/20 text-green-400' :
                    status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-700 text-gray-400'
                    }`}>
                    {status === 'active' ? '● Active' : status === 'learning' ? '◐ Learning' : '○ Ready'}
                </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    );
};

export default function MeIA() {
    const [activeTab, setActiveTab] = useState('secretary');
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [aiStatus, setAiStatus] = useState({ initialized: false, hasApiKey: false });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Secretary Mode State
    const [secretaryEnabled, setSecretaryEnabled] = useState(false);
    const [secretaryDirectives, setSecretaryDirectives] = useState('');
    const [secretaryPersonality, setSecretaryPersonality] = useState('professional');
    const [secretaryTasks] = useState([]);
    const [secretaryStats] = useState({
        messagesHandled: 0,
        appointmentsBooked: 0,
        leadsQualified: 0,
        questionsAnswered: 0
    });

    // AI Config State  
    const [aiConfig, setAiConfig] = useState({
        enabled: false,
        systemPrompt: '',
        autoReply: false,
        quickReplies: [],
        workingHours: { start: '09:00', end: '21:00' },
        awayMessage: ''
    });

    // Selected AI Model
    const [selectedAiModel, setSelectedAiModel] = useState('claude-3.5-sonnet');

    // Available AI Models
    const aiModels = [
        {
            id: 'claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            description: 'Best balance of performance/cost',
            icon: '🧠',
            color: 'from-orange-500 to-amber-600',
            features: ['Advanced analysis', '200K context', 'Fast'],
            recommended: true
        },
        {
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            provider: 'Anthropic',
            description: 'Most intelligent and creative',
            icon: '🎭',
            color: 'from-purple-500 to-violet-600',
            features: ['Ultra intelligent', 'Creative', '200K context']
        },
        {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            provider: 'OpenAI',
            description: 'OpenAI flagship model with vision',
            icon: '🤖',
            color: 'from-green-500 to-emerald-600',
            features: ['Vision', 'Function calling', '128K context']
        },
        {
            id: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            description: 'Fastest Omni-model',
            icon: '⚡',
            color: 'from-teal-500 to-cyan-600',
            features: ['Ultra fast', 'Multimodal', 'Native audio']
        },
        {
            id: 'gemini-pro',
            name: 'Gemini 1.5 Pro',
            provider: 'Google',
            description: 'Google intelligence with long context',
            icon: '💎',
            color: 'from-blue-500 to-indigo-600',
            features: ['1M context', 'Vision', 'Code expert']
        },
        {
            id: 'gemini-flash',
            name: 'Gemini 1.5 Flash',
            provider: 'Google',
            description: 'Fast and economical',
            icon: '⚡',
            color: 'from-sky-500 to-blue-600',
            features: ['Ultra fast', 'Economical', '1M context']
        },
        {
            id: 'mistral-large',
            name: 'Mistral Large',
            provider: 'Mistral AI',
            description: 'Best from Mistral',
            icon: '🌪️',
            color: 'from-red-500 to-rose-600',
            features: ['European', 'Multilingual', 'Reasoning']
        },
        {
            id: 'mistral-medium',
            name: 'Mistral Medium',
            provider: 'Mistral AI',
            description: 'Good value for money',
            icon: '💨',
            color: 'from-pink-500 to-rose-600',
            features: ['Fast', 'Economical', 'Multilingual']
        },
        {
            id: 'llama-3-70b',
            name: 'LLaMA 3 70B',
            provider: 'Meta',
            description: 'Powerful open source',
            icon: '🦙',
            color: 'from-indigo-500 to-purple-600',
            features: ['Open Source', 'Performant', 'Free']
        },
        {
            id: 'llama-3-8b',
            name: 'LLaMA 3 8B',
            provider: 'Meta',
            description: 'Lightweight and fast',
            icon: '🦙',
            color: 'from-violet-500 to-indigo-600',
            features: ['Lightweight', 'Very fast', 'Free']
        },
        {
            id: 'command-r-plus',
            name: 'Command R+',
            provider: 'Cohere',
            description: 'Optimized for business',
            icon: '📊',
            color: 'from-amber-500 to-orange-600',
            features: ['RAG optimized', 'Business', 'Multilingual']
        },
        {
            id: 'deepseek-v2',
            name: 'DeepSeek V2',
            provider: 'DeepSeek',
            description: 'Code and math expert',
            icon: '🔬',
            color: 'from-cyan-500 to-teal-600',
            features: ['Code expert', 'Math', 'Economical']
        }
    ];

    // Load data
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load AI status
            const statusRes = await api.get('/ai/status');
            setAiStatus(statusRes.data);

            // Load sessions
            const sessionsRes = await api.get('/whatsapp/sessions');
            const allSessions = sessionsRes.data.sessions || [];
            setSessions(allSessions);

            const connected = allSessions.find(s => s.status === 'connected');
            if (connected) {
                setSelectedSession(connected.sessionId);
                loadSessionConfig(connected.sessionId);
            }

            // Load secretary directives from localStorage (will be DB later)
            const savedDirectives = localStorage.getItem('meIA_directives');
            if (savedDirectives) {
                setSecretaryDirectives(savedDirectives);
            }

            const savedSecretaryEnabled = localStorage.getItem('meIA_enabled');
            if (savedSecretaryEnabled) {
                setSecretaryEnabled(savedSecretaryEnabled === 'true');
            }

            const savedPersonality = localStorage.getItem('meIA_personality');
            if (savedPersonality) {
                setSecretaryPersonality(savedPersonality);
            }

            // Load selected AI model from localStorage
            const savedAiModel = localStorage.getItem('meIA_selectedModel');
            if (savedAiModel) {
                setSelectedAiModel(savedAiModel);
            }

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSessionConfig = async (sessionId) => {
        try {
            const res = await api.get(`/ai/config/${sessionId}`);
            if (res.data.config) {
                setAiConfig(res.data.config);
            }
        } catch (error) {
            console.error('Failed to load AI config:', error);
        }
    };

    const saveSecretarySettings = () => {
        localStorage.setItem('meIA_directives', secretaryDirectives);
        localStorage.setItem('meIA_enabled', secretaryEnabled.toString());
        localStorage.setItem('meIA_personality', secretaryPersonality);

        setMessage({ type: 'success', text: 'Me IA settings saved!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const saveAiConfig = async () => {
        if (!selectedSession) return;

        try {
            await api.post(`/ai/config/${selectedSession}`, aiConfig);
            setMessage({ type: 'success', text: 'AI configuration saved!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save' });
        }
    };

    const personalities = [
        { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Formal and business-like' },
        { id: 'friendly', label: 'Friendly', icon: Heart, desc: 'Warm and approachable' },
        { id: 'expert', label: 'Expert', icon: Star, desc: 'Knowledgeable and authoritative' },
        { id: 'casual', label: 'Casual', icon: Coffee, desc: 'Relaxed and conversational' }
    ];

    const features = [
        { icon: Mic, title: '🎤 Voice Cloning', description: 'Respond with voice messages using a cloned voice', status: 'ready', color: 'violet', tab: 'voice' },
        { icon: Brain, title: '😊 Sentiment Analysis', description: 'Detect frustrated customers in real-time', status: 'ready', color: 'cyan', tab: 'sentiment' },
        { icon: Target, title: '🎯 Sales Predictor', description: 'Identify hot leads with conversion scoring', status: 'active', color: 'green', tab: 'sales' },
        { icon: Globe, title: '🌍 Real-time Translation', description: 'Automatic translation in 15+ languages', status: 'ready', color: 'orange', tab: 'translate' },
        { icon: Calendar, title: '📅 Meeting Scheduler', description: 'AI negotiates appointments automatically', status: 'active', color: 'pink', tab: 'meetings' },
        { icon: Sparkles, title: '👻 Shadow AI', description: 'Real-time response suggestions while you type', status: 'ready', color: 'violet', tab: 'shadow' },
        { icon: Users, title: '📊 Smart CRM', description: 'Auto-generated customer profiles and tags', status: 'ready', color: 'cyan', tab: 'crm' },
        { icon: FileText, title: '💰 Instant Quotes', description: 'Customer sends photo → Automatic quote', status: 'ready', color: 'green', tab: 'quotes' },
        { icon: Eye, title: '🎬 Video Avatar', description: 'Respond with AI avatar video messages', status: 'ready', color: 'orange', tab: 'video' },
        { icon: Phone, title: '📞 AI Phone Agent', description: 'AI answers and makes calls like a human', status: 'ready', color: 'pink', tab: 'phone' },
        { icon: User, title: '🎭 Personality Cloner', description: 'AI writes EXACTLY like you', status: 'ready', color: 'violet', tab: 'personality' },
        { icon: TrendingUp, title: '🔮 Churn Predictor', description: 'Predicts which customers will leave', status: 'ready', color: 'cyan', tab: 'churn' },
        { icon: Zap, title: '💬 Multi-Agent', description: 'Specialized agents for sales, support, etc.', status: 'ready', color: 'green', tab: 'multiagent' },
        { icon: Eye, title: '🕵️ Competitor Spy', description: 'Analyzes competitor messages', status: 'ready', color: 'orange', tab: 'competitor' },
        { icon: Target, title: '📸 Visual Finder', description: 'Customer sends photo → finds similar product', status: 'ready', color: 'pink', tab: 'visual' },
        { icon: MessageSquare, title: '🎯 Smart Broadcast', description: 'Right message at right time for each customer', status: 'ready', color: 'violet', tab: 'broadcast' },
        { icon: TrendingUp, title: '📊 Analytics', description: 'Heatmaps, best times, words that convert', status: 'ready', color: 'cyan', tab: 'analytics' },
        { icon: Star, title: '🤝 Deal Closer', description: 'Detects hesitation and pushes the right promo', status: 'ready', color: 'green', tab: 'closer' },
        { icon: FileText, title: '📝 Auto-Docs', description: 'Generates FAQ from your conversations', status: 'ready', color: 'orange', tab: 'docs' },
        { icon: Globe, title: '🌐 CRM Sync', description: 'Sync with Salesforce, HubSpot, Pipedrive', status: 'ready', color: 'pink', tab: 'crmsync' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading Me IA...</p>
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
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-pulse">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Me IA
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Your AI clone that acts on your behalf • Like having a virtual you
                            </p>
                        </div>
                    </div>

                    {/* Global Toggle */}
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${secretaryEnabled
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-gray-800 border border-gray-700'
                            }`}>
                            <span className={`text-sm font-medium ${secretaryEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                                Me IA {secretaryEnabled ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => {
                                    setSecretaryEnabled(!secretaryEnabled);
                                    localStorage.setItem('meIA_enabled', (!secretaryEnabled).toString());
                                }}
                                className={`relative w-14 h-7 rounded-full transition-colors ${secretaryEnabled ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${secretaryEnabled ? 'translate-x-8' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-red-500/20 border border-red-500/30'
                        }`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-5 h-5 text-green-400" />
                            : <XCircle className="w-5 h-5 text-red-400" />
                        }
                        <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {message.text}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{secretaryStats.messagesHandled}</p>
                                <p className="text-xs text-gray-400">Messages Handled</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{secretaryStats.appointmentsBooked}</p>
                                <p className="text-xs text-gray-400">Appointments Booked</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{secretaryStats.leadsQualified}</p>
                                <p className="text-xs text-gray-400">Leads Qualified</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{secretaryStats.questionsAnswered}</p>
                                <p className="text-xs text-gray-400">Questions Answered</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-wrap gap-3">
                    <TabButton
                        active={activeTab === 'secretary'}
                        onClick={() => setActiveTab('secretary')}
                        icon={User}
                        label="Secretary Mode"
                    />
                    <TabButton
                        active={activeTab === 'config'}
                        onClick={() => setActiveTab('config')}
                        icon={Settings}
                        label="AI Config"
                    />
                    <TabButton
                        active={activeTab === 'features'}
                        onClick={() => setActiveTab('features')}
                        icon={Sparkles}
                        label="Advanced Features"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                {/* Secretary Mode Tab */}
                {activeTab === 'secretary' && (
                    <div className="space-y-6">
                        {/* Personality Selection */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-violet-400" />
                                Personality
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {personalities.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSecretaryPersonality(p.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${secretaryPersonality === p.id
                                            ? 'border-violet-500 bg-violet-500/10'
                                            : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                                            }`}
                                    >
                                        <p.icon className={`w-6 h-6 mb-2 ${secretaryPersonality === p.id ? 'text-violet-400' : 'text-gray-400'
                                            }`} />
                                        <p className={`font-medium ${secretaryPersonality === p.id ? 'text-white' : 'text-gray-300'
                                            }`}>{p.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Directives */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                Your Directives
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                Tell Me IA exactly how to act on your behalf. Be specific about what it should do, say, and how to handle different situations.
                            </p>
                            <textarea
                                value={secretaryDirectives}
                                onChange={(e) => setSecretaryDirectives(e.target.value)}
                                placeholder={`Example directives:

1. IDENTITY
- You are my personal assistant representing [Your Company]
- Always be polite and professional
- Never reveal that you are an AI

2. INQUIRIES
- For pricing questions, explain our 3 packages: Basic (€99), Pro (€199), Enterprise (€499)
- For availability, I'm available Mon-Fri 9am-6pm
- For urgent matters, ask to schedule a call

3. LEADS
- Qualify leads by asking: budget, timeline, and specific needs
- If budget > €500 and timeline < 1 month, mark as hot lead
- Always collect: name, email, phone, company

4. APPOINTMENTS
- Use my Calendly link: calendly.com/yourname
- Preferred meeting times: 10am, 2pm, 4pm
- Meeting duration: 30 minutes

5. FAQs
- Q: What services do you offer? → A: We offer...
- Q: What are your prices? → A: Our packages start at...
- Q: Can I get a demo? → A: Absolutely! Let me book...

6. ESCALATION
- If customer is angry, apologize and offer to call them back
- If technical question I can't answer, say I'll check with the team
- Never promise something without asking me first`}
                                className="w-full h-96 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none font-mono text-sm"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={saveSecretarySettings}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Directives
                                </button>
                            </div>
                        </div>

                        {/* Active Tasks */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-400" />
                                Recent Actions
                            </h2>
                            {secretaryTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500">No actions yet. Enable Me IA and start receiving messages!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {secretaryTasks.map((task, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg">
                                            <div className={`p-2 rounded-lg ${task.type === 'message' ? 'bg-violet-500/20' :
                                                task.type === 'appointment' ? 'bg-cyan-500/20' : 'bg-green-500/20'
                                                }`}>
                                                {task.type === 'message' ? <MessageSquare className="w-4 h-4 text-violet-400" /> :
                                                    task.type === 'appointment' ? <Calendar className="w-4 h-4 text-cyan-400" /> :
                                                        <Target className="w-4 h-4 text-green-400" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{task.description}</p>
                                                <p className="text-xs text-gray-500">{task.time}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Config Tab */}
                {activeTab === 'config' && (
                    <div className="space-y-6">
                        {/* AI Model Selector - NEW SECTION */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-violet-400" />
                                Choose AI Model
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Select the AI model to use for answering WhatsApp messages.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {aiModels.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedAiModel(model.id);
                                            localStorage.setItem('meIA_selectedModel', model.id);
                                        }}
                                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${selectedAiModel === model.id
                                            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800'
                                            }`}
                                    >
                                        {/* Recommended Badge */}
                                        {model.recommended && (
                                            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                                                ⭐ Recommended
                                            </div>
                                        )}

                                        {/* Selected Check */}
                                        {selectedAiModel === model.id && (
                                            <div className="absolute top-3 right-3">
                                                <CheckCircle className="w-5 h-5 text-violet-400" />
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`text-3xl p-2 bg-gradient-to-br ${model.color} rounded-xl shadow-lg`}>
                                                {model.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold truncate ${selectedAiModel === model.id ? 'text-white' : 'text-gray-200'
                                                    }`}>
                                                    {model.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">{model.provider}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                            {model.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1">
                                            {model.features.map((feature, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-0.5 rounded-full ${selectedAiModel === model.id
                                                        ? 'bg-violet-500/30 text-violet-300'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Model Info */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {aiModels.find(m => m.id === selectedAiModel)?.icon || '🤖'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            Selected model: <span className="text-violet-400">{aiModels.find(m => m.id === selectedAiModel)?.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {aiModels.find(m => m.id === selectedAiModel)?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Original AI Config Section */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-violet-400" />
                                AI Configuration
                            </h2>

                            {/* Session Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Session WhatsApp</label>
                                <select
                                    value={selectedSession || ''}
                                    onChange={(e) => {
                                        setSelectedSession(e.target.value);
                                        loadSessionConfig(e.target.value);
                                    }}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="">Select a session...</option>
                                    {sessions.filter(s => s.status === 'connected').map(s => (
                                        <option key={s.sessionId} value={s.sessionId}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* AI Status */}
                            <div className={`mb-6 p-4 rounded-xl ${aiStatus.initialized
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-yellow-500/20 border border-yellow-500/30'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {aiStatus.initialized
                                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                                        : <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                    }
                                    <span className={aiStatus.initialized ? 'text-green-400' : 'text-yellow-400'}>
                                        {aiStatus.initialized
                                            ? `${aiModels.find(m => m.id === selectedAiModel)?.name || 'AI'} connected and ready`
                                            : 'API key required - Configure in Settings'}
                                    </span>
                                </div>
                            </div>

                            {/* Enable Toggle */}
                            <div className="mb-6 flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">Enable AI responses</p>
                                    <p className="text-sm text-gray-400">Me IA will automatically respond to messages</p>
                                </div>
                                <button
                                    onClick={() => setAiConfig({ ...aiConfig, enabled: !aiConfig.enabled })}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${aiConfig.enabled ? 'bg-violet-500' : 'bg-gray-600'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${aiConfig.enabled ? 'translate-x-8' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            {/* System Prompt */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    System Prompt (Additional instructions)
                                </label>
                                <textarea
                                    value={aiConfig.systemPrompt || ''}
                                    onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                                    placeholder="Additional context for the AI..."
                                    className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 resize-none"
                                />
                            </div>

                            {/* Working Hours */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Working hours start</label>
                                    <input
                                        type="time"
                                        value={aiConfig.workingHours?.start || '09:00'}
                                        onChange={(e) => setAiConfig({
                                            ...aiConfig,
                                            workingHours: { ...aiConfig.workingHours, start: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Working hours end</label>
                                    <input
                                        type="time"
                                        value={aiConfig.workingHours?.end || '21:00'}
                                        onChange={(e) => setAiConfig({
                                            ...aiConfig,
                                            workingHours: { ...aiConfig.workingHours, end: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Away Message */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Away message (Outside working hours)</label>
                                <textarea
                                    value={aiConfig.awayMessage || ''}
                                    onChange={(e) => setAiConfig({ ...aiConfig, awayMessage: e.target.value })}
                                    placeholder="Thank you for your message! I am currently away but will respond as soon as possible."
                                    className="w-full h-24 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={saveAiConfig}
                                    disabled={!selectedSession}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                                Advanced AI Features
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Supercharge Me IA with these advanced capabilities. Each feature learns from your interactions.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {features.map((feature, i) => (
                                    <FeatureCard
                                        key={i}
                                        {...feature}
                                        onClick={() => {
                                            // Navigate to advanced AI with specific tab
                                            window.location.href = `/advanced-ai?tab=${feature.tab}`;
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-cyan-400" />
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button className="p-4 bg-gray-900 rounded-xl border border-gray-700 hover:border-violet-500 transition-all text-left group">
                                    <Brain className="w-6 h-6 text-violet-400 mb-2" />
                                    <p className="text-white font-medium group-hover:text-violet-400">Train AI</p>
                                    <p className="text-xs text-gray-500">Upload conversations</p>
                                </button>
                                <button className="p-4 bg-gray-900 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all text-left group">
                                    <Mic className="w-6 h-6 text-cyan-400 mb-2" />
                                    <p className="text-white font-medium group-hover:text-cyan-400">Record Voice</p>
                                    <p className="text-xs text-gray-500">Clone your voice</p>
                                </button>
                                <button className="p-4 bg-gray-900 rounded-xl border border-gray-700 hover:border-green-500 transition-all text-left group">
                                    <Eye className="w-6 h-6 text-green-400 mb-2" />
                                    <p className="text-white font-medium group-hover:text-green-400">Watch Mode</p>
                                    <p className="text-xs text-gray-500">Learn from you</p>
                                </button>
                                <button className="p-4 bg-gray-900 rounded-xl border border-gray-700 hover:border-orange-500 transition-all text-left group">
                                    <Shield className="w-6 h-6 text-orange-400 mb-2" />
                                    <p className="text-white font-medium group-hover:text-orange-400">Safe Mode</p>
                                    <p className="text-xs text-gray-500">Review before send</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
