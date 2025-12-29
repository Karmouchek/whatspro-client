// Advanced AI Dashboard - All the crazy features in one place
import { useState, useEffect } from 'react';
import {
  Mic, Brain, TrendingUp, Globe, Calendar, Sparkles, 
  Users, FileText, AlertTriangle, CheckCircle, Settings,
  ChevronRight, Zap, MessageSquare, BarChart3, Target,
  Volume2, Languages, Clock, UserCheck, DollarSign, Video,
  Phone, PhoneCall, PhoneIncoming, PhoneOutgoing,
  UserCog, TrendingDown, GitBranch, Copy, Shield,
  Eye, Camera, Send, PieChart, Award, BookOpen, Link2
} from 'lucide-react';
import api from '../services/api';

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, status, onClick, color = 'violet' }) => (
  <div 
    onClick={onClick}
    className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-${color}-500 
                transition-all cursor-pointer hover:shadow-lg hover:shadow-${color}-500/20`}
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${
        status === 'active' ? 'bg-green-500/20 text-green-400' :
        status === 'configured' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-600/50 text-gray-400'
      }`}>
        {status === 'active' ? '● Active' : status === 'configured' ? '◐ Configured' : '○ Inactive'}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-white mt-4">{title}</h3>
    <p className="text-gray-400 text-sm mt-2">{description}</p>
    <div className="flex items-center text-violet-400 text-sm mt-4">
      Configure <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, trend, color = 'violet' }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
    {trend && (
      <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
      </p>
    )}
  </div>
);

export default function AdvancedAI() {
  const [activeTab, setActiveTab] = useState('overview');
  const [servicesStatus, setServicesStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load services status
      const statusRes = await api.get('/advanced-ai/status');
      setServicesStatus(statusRes.data.services || {});

      // Load sessions
      const sessionsRes = await api.get('/whatsapp/sessions');
      setSessions(sessionsRes.data.sessions || []);
      if (sessionsRes.data.sessions?.length > 0) {
        setSelectedSession(sessionsRes.data.sessions[0].id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'voice',
      icon: Volume2,
      title: '🎤 Voice Cloning',
      description: "Respond with voice messages using a cloned voice. AI speaks like you!",
      color: 'pink',
      status: servicesStatus.voiceCloning?.initialized ? 'configured' : 'inactive'
    },
    {
      id: 'sentiment',
      icon: Brain,
      title: '😊 Sentiment Analysis',
      description: 'Detect frustrated customers in real-time. Automatic alerts.',
      color: 'yellow',
      status: servicesStatus.sentimentAnalysis?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'sales',
      icon: Target,
      title: '🎯 Sales Predictor',
      description: 'Identify hot leads. Real-time conversion score.',
      color: 'green',
      status: servicesStatus.salesPredictor?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'translate',
      icon: Languages,
      title: '🌍 Real-time Translation',
      description: 'Customer in Arabic, you in English. Transparent and automatic.',
      color: 'blue',
      status: servicesStatus.realtimeTranslator?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'meetings',
      icon: Calendar,
      title: '📅 Meeting Scheduler',
      description: "AI negotiates appointments with your clients. Calendar sync.",
      color: 'orange',
      status: servicesStatus.meetingScheduler?.initialized ? 'configured' : 'inactive'
    },
    {
      id: 'shadow',
      icon: Sparkles,
      title: '👻 Shadow AI',
      description: "Real-time response suggestions while you type.",
      color: 'purple',
      status: servicesStatus.shadowAI?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'crm',
      icon: Users,
      title: '📊 Smart CRM',
      description: 'Auto-generated customer profiles. Smart tags. Visual pipeline.',
      color: 'cyan',
      status: servicesStatus.smartCRM?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'quotes',
      icon: FileText,
      title: '💰 Instant Quotes',
      description: 'Customer sends a photo → Automatic quote in 5 seconds.',
      color: 'emerald',
      status: servicesStatus.instantQuote?.initialized ? 'configured' : 'inactive'
    },
    {
      id: 'video',
      icon: Video,
      title: '🎬 Video Avatar',
      description: 'Respond with video using an AI avatar that speaks like you!',
      color: 'red',
      status: servicesStatus.videoAvatar?.initialized ? 'configured' : 'inactive'
    },
    {
      id: 'phone',
      icon: Phone,
      title: '📞 AI Phone Agent',
      description: "AI answers calls and makes calls like a human!",
      color: 'indigo',
      status: servicesStatus.aiPhoneAgent?.initialized ? 'configured' : 'inactive'
    },
    {
      id: 'personality',
      icon: Copy,
      title: '🎭 Personality Cloner',
      description: "AI writes EXACTLY like you. Clones your style!",
      color: 'fuchsia',
      status: servicesStatus.personalityCloner?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'churn',
      icon: TrendingDown,
      title: '🔮 Churn Predictor',
      description: 'Predicts which customers will leave before they do!',
      color: 'rose',
      status: servicesStatus.churnPredictor?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'multiagent',
      icon: GitBranch,
      title: '💬 Multi-Agent',
      description: 'Specialized agents (sales, support, appointments) that hand off customers.',
      color: 'amber',
      status: servicesStatus.multiAgentHandoff?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'competitor',
      icon: Eye,
      title: '🕵️ Competitor Spy',
      description: 'Analyzes competitor messages and suggests how to do better.',
      color: 'slate',
      status: servicesStatus.competitorSpy?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'visual',
      icon: Camera,
      title: '📸 Visual Finder',
      description: 'Customer sends photo → finds similar product in your catalog.',
      color: 'teal',
      status: servicesStatus.visualProductFinder?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'broadcast',
      icon: Send,
      title: '🎯 Smart Broadcast',
      description: 'Sends the right message at the right time to each customer.',
      color: 'sky',
      status: servicesStatus.smartBroadcast?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'analytics',
      icon: PieChart,
      title: '📊 Analytics',
      description: 'Heatmaps, best times, words that convert.',
      color: 'violet',
      status: servicesStatus.conversationAnalytics?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'closer',
      icon: Award,
      title: '🤝 Deal Closer',
      description: 'Detects hesitation and pushes the right promo automatically.',
      color: 'lime',
      status: servicesStatus.dealCloser?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'docs',
      icon: BookOpen,
      title: '📝 Auto-Docs',
      description: 'Generates FAQ and documentation from your conversations.',
      color: 'orange',
      status: servicesStatus.autoDocumentation?.initialized ? 'active' : 'inactive'
    },
    {
      id: 'crmsync',
      icon: Link2,
      title: '🌐 CRM Sync',
      description: 'Bidirectional sync with Salesforce, HubSpot, Pipedrive.',
      color: 'cyan',
      status: servicesStatus.crmSync?.initialized ? 'active' : 'inactive'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Advanced AI Features
          </h1>
        </div>
        <p className="text-gray-400">
          20 revolutionary AI features to dominate the market 🚀
        </p>
      </div>

      {/* Session Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">WhatsApp Session</label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-full max-w-md"
        >
          {sessions.length === 0 ? (
            <option value="">No sessions available - Create one first</option>
          ) : (
            <>
              <option value="">Select a session...</option>
              {sessions.map(session => (
                <option key={session.sessionId || session.id} value={session.sessionId || session.id}>
                  {session.name || session.sessionId || session.id} {session.phoneNumber ? `(+${session.phoneNumber})` : ''} - {session.status || 'unknown'}
                </option>
              ))}
            </>
          )}
        </select>
        {sessions.length === 0 && (
          <p className="mt-2 text-sm text-yellow-400">
            ⚠️ No WhatsApp sessions found. Please create a session in the WhatsApp page first.
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          icon={Zap} 
          label="Active Services" 
          value={Object.values(servicesStatus).filter(s => s.initialized).length + '/20'}
          color="violet"
        />
        <StatsCard 
          icon={MessageSquare} 
          label="Messages Analyzed" 
          value="--"
          color="blue"
        />
        <StatsCard 
          icon={Target} 
          label="Hot Leads" 
          value="--"
          color="green"
        />
        <StatsCard 
          icon={AlertTriangle} 
          label="Sentiment Alerts" 
          value="--"
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'voice', label: 'Voice Cloning', icon: Volume2 },
          { id: 'sentiment', label: 'Sentiment', icon: Brain },
          { id: 'sales', label: 'Sales', icon: Target },
          { id: 'translate', label: 'Translation', icon: Languages },
          { id: 'meetings', label: 'Meetings', icon: Calendar },
          { id: 'shadow', label: 'Shadow AI', icon: Sparkles },
          { id: 'crm', label: 'CRM', icon: Users },
          { id: 'quotes', label: 'Quotes', icon: FileText },
          { id: 'video', label: 'Video Avatar', icon: Video },
          { id: 'phone', label: 'Phone Agent', icon: Phone },
          { id: 'personality', label: 'Personality', icon: Copy },
          { id: 'churn', label: 'Churn', icon: TrendingDown },
          { id: 'multiagent', label: 'Multi-Agent', icon: GitBranch },
          { id: 'competitor', label: 'Spy', icon: Eye },
          { id: 'visual', label: 'Visual', icon: Camera },
          { id: 'broadcast', label: 'Broadcast', icon: Send },
          { id: 'analytics', label: 'Analytics', icon: PieChart },
          { id: 'closer', label: 'Closer', icon: Award },
          { id: 'docs', label: 'Docs', icon: BookOpen },
          { id: 'crmsync', label: 'CRM Sync', icon: Link2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-violet-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              status={feature.status}
              color={feature.color}
              onClick={() => setActiveTab(feature.id)}
            />
          ))}
        </div>
      )}

      {activeTab === 'voice' && <VoiceCloningPanel sessionId={selectedSession} />}
      {activeTab === 'sentiment' && <SentimentPanel sessionId={selectedSession} />}
      {activeTab === 'sales' && <SalesPanel sessionId={selectedSession} />}
      {activeTab === 'translate' && <TranslatePanel sessionId={selectedSession} />}
      {activeTab === 'meetings' && <MeetingsPanel sessionId={selectedSession} />}
      {activeTab === 'shadow' && <ShadowAIPanel sessionId={selectedSession} />}
      {activeTab === 'crm' && <CRMPanel sessionId={selectedSession} />}
      {activeTab === 'quotes' && <QuotesPanel sessionId={selectedSession} />}
      {activeTab === 'video' && <VideoAvatarPanel sessionId={selectedSession} />}
      {activeTab === 'phone' && <PhoneAgentPanel sessionId={selectedSession} />}
      {activeTab === 'personality' && <PersonalityPanel sessionId={selectedSession} />}
      {activeTab === 'churn' && <ChurnPanel sessionId={selectedSession} />}
      {activeTab === 'multiagent' && <MultiAgentPanel sessionId={selectedSession} />}
      {activeTab === 'competitor' && <CompetitorSpyPanel sessionId={selectedSession} />}
      {activeTab === 'visual' && <VisualFinderPanel sessionId={selectedSession} />}
      {activeTab === 'broadcast' && <SmartBroadcastPanel sessionId={selectedSession} />}
      {activeTab === 'analytics' && <AnalyticsPanel sessionId={selectedSession} />}
      {activeTab === 'closer' && <DealCloserPanel sessionId={selectedSession} />}
      {activeTab === 'docs' && <AutoDocsPanel sessionId={selectedSession} />}
      {activeTab === 'crmsync' && <CRMSyncPanel sessionId={selectedSession} />}
    </div>
  );
}

// Voice Cloning Panel
function VoiceCloningPanel({ sessionId }) {
  const [voices, setVoices] = useState([]);
  const [customVoices, setCustomVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testText, setTestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');

  useEffect(() => {
    loadVoices();
  }, [sessionId]);

  const loadVoices = async () => {
    try {
      const [voicesRes, customRes] = await Promise.all([
        api.get('/advanced-ai/voice/voices'),
        sessionId ? api.get(`/advanced-ai/voice/custom/${sessionId}`) : Promise.resolve({ data: { voices: [] } })
      ]);
      setVoices(voicesRes.data.voices || []);
      setCustomVoices(customRes.data.voices || []);
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  const testVoice = async () => {
    if (!testText || !sessionId) return;
    setLoading(true);
    try {
      const res = await api.post('/advanced-ai/voice/generate', {
        sessionId,
        text: testText
      });
      // Play audio
      if (res.data.audioUrl) {
        const audio = new Audio(res.data.audioUrl);
        audio.play();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVoice = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadName || !sessionId) {
      alert('Please enter a name and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('sessionId', sessionId);
      formData.append('name', uploadName);

      await api.post('/advanced-ai/voice/upload-custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('✅ Custom voice added!');
      setUploadName('');
      loadVoices();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteCustomVoice = async (voiceId) => {
    if (!confirm('Delete this custom voice?')) return;
    try {
      await api.delete(`/advanced-ai/voice/custom/${sessionId}/${voiceId}`);
      loadVoices();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Volume2 className="w-6 h-6 text-pink-400" />
        Voice Cloning Configuration
      </h2>
      
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 mb-6">
        <p className="text-pink-300 text-sm">
          🎤 Transform AI responses into voice messages with a custom voice.
          Requires an ElevenLabs API key.
        </p>
      </div>

      {/* Upload Custom Voice */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          ✨ Add Custom Voice
        </h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Voice Name</label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="My custom voice"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <label className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 ${
            uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          } text-white`}>
            {uploading ? '⏳ Uploading...' : '📁 Upload Audio'}
            <input
              type="file"
              accept="audio/*"
              onChange={handleUploadVoice}
              disabled={uploading || !uploadName}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">Formats: MP3, WAV, M4A (min 30 seconds recommended)</p>
      </div>

      {/* Custom Voices List */}
      {customVoices.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">🎨 My Custom Voices</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {customVoices.map(voice => (
              <div 
                key={voice.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedVoice === voice.elevenlabs_voice_id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:border-purple-400'
                }`}
                onClick={() => setSelectedVoice(voice.elevenlabs_voice_id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{voice.voice_name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCustomVoice(voice.id); }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-xs text-purple-300">✨ Custom</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">ElevenLabs Pre-made Voices</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select a voice...</option>
            {voices.map(voice => (
              <option key={voice.voiceId} value={voice.voiceId}>
                {voice.name} ({voice.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Test Voice</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
          />
        </div>

        <button
          onClick={testVoice}
          disabled={loading || !testText}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : '🔊 Test'}
        </button>
      </div>
    </div>
  );
}

// Sentiment Analysis Panel
function SentimentPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        api.get(`/advanced-ai/sentiment/dashboard/${sessionId}`),
        api.get('/advanced-ai/sentiment/alerts')
      ]);
      setStats(statsRes.data.stats);
      setAlerts(alertsRes.data.alerts || []);
    } catch (err) {
      console.error('Failed to load sentiment data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-yellow-400" />
          Sentiment Analysis
        </h2>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{stats.positive_count || 0}</p>
              <p className="text-sm text-gray-400">Positive 😊</p>
            </div>
            <div className="bg-gray-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-400">{stats.neutral_count || 0}</p>
              <p className="text-sm text-gray-400">Neutral 😐</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{stats.negative_count || 0}</p>
              <p className="text-sm text-gray-400">Negative 😠</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{stats.urgent_count || 0}</p>
              <p className="text-sm text-gray-400">Urgent 🚨</p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🚨 Unread Alerts</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-400">No pending alerts</p>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.alert_type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{alert.contact_name || 'Contact'}</p>
                    <p className="text-sm text-gray-400 mt-1">{alert.message_preview}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.alert_type === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {alert.alert_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sales Predictor Panel
function SalesPanel({ sessionId }) {
  const [hotLeads, setHotLeads] = useState([]);
  const [pipelineStats, setPipelineStats] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [leadsRes, pipelineRes] = await Promise.all([
        api.get(`/advanced-ai/sales/hot-leads/${sessionId}`),
        api.get(`/advanced-ai/sales/pipeline/${sessionId}`)
      ]);
      setHotLeads(leadsRes.data.leads || []);
      setPipelineStats(pipelineRes.data.stats);
    } catch (err) {
      console.error('Failed to load sales data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-green-400" />
          Sales Predictor
        </h2>

        {pipelineStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{pipelineStats.total}</p>
              <p className="text-sm text-gray-400">Total Leads</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{pipelineStats.hotLeads}</p>
              <p className="text-sm text-gray-400">Hot Leads 🔥</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{Math.round(pipelineStats.avgScore || 0)}</p>
              <p className="text-sm text-gray-400">Average Score</p>
            </div>
          </div>
        )}
      </div>

      {/* Hot Leads */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🔥 Hot Leads</h3>
        {hotLeads.length === 0 ? (
          <p className="text-gray-400">No hot leads detected</p>
        ) : (
          <div className="space-y-3">
            {hotLeads.map(lead => (
              <div key={lead.chat_id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{lead.contact_name || lead.chat_id}</p>
                  <p className="text-sm text-gray-400">Last interaction: {new Date(lead.last_interaction).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{lead.score}</p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder panels for other features
function TranslatePanel({ sessionId }) {
  // Static list of supported languages with country codes for flag images - USA first, France last
  const supportedLanguages = [
    { code: 'en', name: 'English', countryCode: 'us' },
    { code: 'es', name: 'Spanish', countryCode: 'es' },
    { code: 'de', name: 'German', countryCode: 'de' },
    { code: 'it', name: 'Italian', countryCode: 'it' },
    { code: 'pt', name: 'Portuguese', countryCode: 'pt' },
    { code: 'ar', name: 'Arabic', countryCode: 'sa' },
    { code: 'zh', name: 'Chinese', countryCode: 'cn' },
    { code: 'ja', name: 'Japanese', countryCode: 'jp' },
    { code: 'ko', name: 'Korean', countryCode: 'kr' },
    { code: 'hi', name: 'Hindi', countryCode: 'in' },
    { code: 'tr', name: 'Turkish', countryCode: 'tr' },
    { code: 'nl', name: 'Dutch', countryCode: 'nl' },
    { code: 'pl', name: 'Polish', countryCode: 'pl' },
    { code: 'uk', name: 'Ukrainian', countryCode: 'ua' },
    { code: 'fr', name: 'French', countryCode: 'fr' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Languages className="w-6 h-6 text-blue-400" />
        Real-time Translation
      </h2>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-blue-300 text-sm">
          Automatic bidirectional translation. Customer writes in their language, 
          you see it in English. You reply in English, they receive it in their language.
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {supportedLanguages.map((lang) => (
          <div key={lang.code} className="bg-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer">
            <img 
              src={`https://flagcdn.com/48x36/${lang.countryCode}.png`}
              alt={lang.name}
              className="w-12 h-9 mx-auto rounded shadow-md"
            />
            <p className="text-sm text-white mt-2 font-medium">{lang.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingsPanel({ sessionId }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-orange-400" />
        Meeting Scheduler
      </h2>
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <p className="text-orange-300 text-sm">
          📅 AI automatically negotiates appointment slots with your clients via WhatsApp.
          Google Calendar / Outlook sync coming soon.
        </p>
      </div>
    </div>
  );
}

function ShadowAIPanel({ sessionId }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-purple-400" />
        Shadow AI
      </h2>
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          👻 While you type, AI suggests 3 responses in real-time.
          Click to send. AI learns from your preferences.
        </p>
      </div>
    </div>
  );
}

function CRMPanel({ sessionId }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Smart CRM
      </h2>
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-cyan-300 text-sm">
          📊 Customer profiles automatically generated by AI. Smart tags,
          complete history, visual sales pipeline.
        </p>
      </div>
    </div>
  );
}

function QuotesPanel({ sessionId }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-emerald-400" />
        Instant Quotes
      </h2>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <p className="text-emerald-300 text-sm">
          💰 Customer sends a photo or describes what they want → AI generates a quote
          instantly based on your product catalog.
        </p>
      </div>
    </div>
  );
}

// Video Avatar Panel
function VideoAvatarPanel({ sessionId }) {
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [customAvatars, setCustomAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testText, setTestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [uploadName, setUploadName] = useState('');

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [avatarsRes, voicesRes, customRes] = await Promise.all([
        api.get('/advanced-ai/video/avatars'),
        api.get('/advanced-ai/video/voices'),
        sessionId ? api.get(`/advanced-ai/video/custom/${sessionId}`) : Promise.resolve({ data: { avatars: [] } })
      ]);
      setAvatars(avatarsRes.data.avatars || []);
      setVoices(voicesRes.data.voices || []);
      setCustomAvatars(customRes.data.avatars || []);

      // Load current profile
      if (sessionId) {
        try {
          const profileRes = await api.get(`/advanced-ai/video/profile/${sessionId}`);
          if (profileRes.data.profile) {
            setProfile(profileRes.data.profile);
            setSelectedAvatar(profileRes.data.profile.avatar_id || '');
            setSelectedVoice(profileRes.data.profile.voice_id || '');
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load video avatar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveAvatar = async () => {
    if (!selectedAvatar || !selectedVoice || !sessionId) return;
    setLoading(true);
    try {
      const avatarInfo = avatars.find(a => a.avatarId === selectedAvatar);
      await api.post('/advanced-ai/video/set-avatar', {
        sessionId,
        avatarId: selectedAvatar,
        voiceId: selectedVoice,
        avatarName: avatarInfo?.name || 'Avatar'
      });
      alert('✅ Avatar configured!');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!testText || !sessionId) return;
    setGenerating(true);
    setVideoResult(null);
    try {
      const res = await api.post('/advanced-ai/video/generate', {
        sessionId,
        text: testText,
        chatId: 'test'
      });
      
      // Poll for completion
      const videoId = res.data.videoId;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      const checkStatus = async () => {
        attempts++;
        const statusRes = await api.get(`/advanced-ai/video/status/${videoId}`);
        
        if (statusRes.data.status === 'completed') {
          setVideoResult(statusRes.data);
          setGenerating(false);
        } else if (statusRes.data.status === 'failed' || attempts >= maxAttempts) {
          alert('❌ Generation failed');
          setGenerating(false);
        } else {
          setTimeout(checkStatus, 5000);
        }
      };
      
      setTimeout(checkStatus, 5000);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
      setGenerating(false);
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !uploadName || !sessionId) {
      alert('Please enter a name and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(type === 'voice' ? 'audio' : type, file);
      formData.append('sessionId', sessionId);
      formData.append('name', uploadName);

      const endpoint = type === 'image' ? '/advanced-ai/video/upload-image' :
                       type === 'video' ? '/advanced-ai/video/upload-video' :
                       '/advanced-ai/video/upload-voice';

      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`✅ Custom ${type === 'image' ? 'image' : type === 'video' ? 'video' : 'voice'} added!`);
      setUploadName('');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCombinedUpload = async (videoFile, audioFile) => {
    if (!videoFile || !audioFile || !uploadName || !sessionId) {
      alert('Please enter a name and select both files');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('audio', audioFile);
      formData.append('sessionId', sessionId);
      formData.append('name', uploadName);

      await api.post('/advanced-ai/video/upload-combined', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('✅ Combined avatar created!');
      setUploadName('');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const deleteCustomAvatar = async (avatarId) => {
    if (!confirm('Delete this custom element?')) return;
    try {
      await api.delete(`/advanced-ai/video/custom/${sessionId}/${avatarId}`);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading && avatars.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Video className="w-6 h-6 text-red-400" />
          Video Avatar Configuration
        </h2>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">
            🎬 Create videos with an AI avatar that speaks! Perfect for personalized 
            and engaging responses. Requires a HeyGen API key.
          </p>
        </div>

        {/* Custom Upload Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            ✨ Add Custom Element
          </h3>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="My custom avatar"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Image Upload */}
            <label className={`p-3 rounded-lg cursor-pointer text-center transition-all ${
              uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/30'
            }`}>
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-white text-sm font-medium">Image</div>
              <div className="text-xs text-gray-400">Avatar photo</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'image')}
                disabled={uploading || !uploadName}
                className="hidden"
              />
            </label>

            {/* Video Upload */}
            <label className={`p-3 rounded-lg cursor-pointer text-center transition-all ${
              uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/30'
            }`}>
              <div className="text-2xl mb-1">🎥</div>
              <div className="text-white text-sm font-medium">Video</div>
              <div className="text-xs text-gray-400">Instant avatar</div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleUpload(e, 'video')}
                disabled={uploading || !uploadName}
                className="hidden"
              />
            </label>

            {/* Voice Upload */}
            <label className={`p-3 rounded-lg cursor-pointer text-center transition-all ${
              uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/30'
            }`}>
              <div className="text-2xl mb-1">🎤</div>
              <div className="text-white text-sm font-medium">Voice</div>
              <div className="text-xs text-gray-400">Voice clone</div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleUpload(e, 'voice')}
                disabled={uploading || !uploadName}
                className="hidden"
              />
            </label>

            {/* Combined Upload */}
            <div className={`p-3 rounded-lg text-center transition-all ${
              uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30'
            }`}>
              <div className="text-2xl mb-1">🎬</div>
              <div className="text-white text-sm font-medium">Combined</div>
              <div className="text-xs text-gray-400">Video + Audio</div>
              <div className="flex gap-1 mt-2">
                <label className="flex-1 px-2 py-1 bg-gray-700 rounded text-xs text-white cursor-pointer hover:bg-gray-600">
                  📹
                  <input
                    type="file"
                    accept="video/*"
                    id="combined-video"
                    className="hidden"
                  />
                </label>
                <label className="flex-1 px-2 py-1 bg-gray-700 rounded text-xs text-white cursor-pointer hover:bg-gray-600">
                  🔊
                  <input
                    type="file"
                    accept="audio/*"
                    id="combined-audio"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          {uploading && (
            <div className="mt-3 text-center text-cyan-300 text-sm">
              ⏳ Uploading...
            </div>
          )}
        </div>

        {/* Custom Avatars List */}
        {customAvatars.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">🎨 My Custom Elements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {customAvatars.map(avatar => (
                <div 
                  key={avatar.id}
                  className="p-3 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{avatar.name}</span>
                    <button
                      onClick={() => deleteCustomAvatar(avatar.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {avatar.type === 'image' ? '🖼️' : 
                       avatar.type === 'video' ? '🎥' : 
                       avatar.type === 'voice' ? '🎤' : '🎬'}
                    </span>
                    <span className="text-xs text-cyan-300">✨ {avatar.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avatar Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select HeyGen Avatar</label>
            <select
              value={selectedAvatar}
              onChange={(e) => setSelectedAvatar(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select an avatar...</option>
              {avatars.map(avatar => (
                <option key={avatar.avatarId} value={avatar.avatarId}>
                  {avatar.name} ({avatar.gender})
                </option>
              ))}
            </select>
            
            {/* Avatar Preview */}
            {selectedAvatar && avatars.find(a => a.avatarId === selectedAvatar)?.previewUrl && (
              <div className="mt-3">
                <img 
                  src={avatars.find(a => a.avatarId === selectedAvatar).previewUrl}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select a voice...</option>
              {voices.map(voice => (
                <option key={voice.voiceId} value={voice.voiceId}>
                  {voice.name} - {voice.language} ({voice.gender})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={saveAvatar}
          disabled={loading || !selectedAvatar || !selectedVoice}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          💾 Save Configuration
        </button>

        {profile && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ Current avatar: {profile.avatar_name || 'Configured'}
            </p>
          </div>
        )}
      </div>

      {/* Test Video Generation */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🎥 Test Video Generation</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Texte à convertir en vidéo</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Bonjour ! Je suis votre assistant virtuel..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
          />
        </div>

        <button
          onClick={generateVideo}
          disabled={generating || !testText || !profile}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>🎬 Generate Video</>
          )}
        </button>

        {!profile && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ Configure an avatar above first
          </p>
        )}

        {/* Video Result */}
        {videoResult && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h4 className="text-white font-medium mb-3">✅ Video Generated!</h4>
            <video 
              src={videoResult.videoUrl} 
              controls 
              className="w-full max-w-md rounded-lg"
            />
            <p className="text-gray-400 text-sm mt-2">
              Duration: {videoResult.duration?.toFixed(1)}s
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// AI Phone Agent Panel
function PhoneAgentPanel({ sessionId }) {
  const [voices, setVoices] = useState([]);
  const [customVoices, setCustomVoices] = useState([]);
  const [agent, setAgent] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [callHistory, setCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  
  // Agent config
  const [agentName, setAgentName] = useState('Assistant IA');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [greeting, setGreeting] = useState('Bonjour ! Comment puis-je vous aider ?');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Call form
  const [callNumber, setCallNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [voicesRes, customVoicesRes, agentRes, numbersRes, historyRes, statsRes] = await Promise.all([
        api.get('/advanced-ai/phone/voices'),
        api.get(`/advanced-ai/phone/custom-voices/${sessionId}`),
        api.get(`/advanced-ai/phone/agent/${sessionId}`),
        api.get(`/advanced-ai/phone/numbers/${sessionId}`),
        api.get(`/advanced-ai/phone/history/${sessionId}?limit=10`),
        api.get(`/advanced-ai/phone/stats/${sessionId}`)
      ]);
      
      setVoices(voicesRes.data.voices || []);
      setCustomVoices(customVoicesRes.data.voices || []);
      setAgent(agentRes.data.agent);
      setPhoneNumbers(numbersRes.data.numbers || []);
      setCalls(historyRes.data.calls || []);
      setStats(statsRes.data.stats);
      
      if (agentRes.data.agent) {
        setAgentName(agentRes.data.agent.agent_name || 'Assistant IA');
        setSelectedVoice(agentRes.data.agent.voice_id || '');
        setGreeting(agentRes.data.agent.greeting || '');
        setSystemPrompt(agentRes.data.agent.system_prompt || '');
      }
    } catch (err) {
      console.error('Failed to load phone data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await api.post('/advanced-ai/phone/create-agent', {
        sessionId,
        name: agentName,
        voiceId: selectedVoice,
        greeting,
        systemPrompt
      });
      alert('✅ Agent téléphonique créé !');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async () => {
    if (!callNumber || !sessionId) return;
    setCalling(true);
    try {
      const res = await api.post('/advanced-ai/phone/call', {
        sessionId,
        toNumber: callNumber,
        customerName
      });
      alert(`✅ Call started! ID: ${res.data.callId}`);
      setCallNumber('');
      setCustomerName('');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setCalling(false);
    }
  };

  const handleUploadVoice = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadName || !sessionId) {
      alert('Please enter a name and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('sessionId', sessionId);
      formData.append('name', uploadName);

      await api.post('/advanced-ai/phone/upload-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('✅ Custom voice added!');
      setUploadName('');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteCustomVoice = async (voiceId) => {
    if (!confirm('Delete this custom voice?')) return;
    try {
      await api.delete(`/advanced-ai/phone/custom-voice/${sessionId}/${voiceId}`);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading && !agent) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Phone className="w-6 h-6 text-indigo-400" />
          AI Phone Agent
        </h2>
        <p className="text-indigo-200 text-sm">
          🤖 AI answers phone calls and makes calls like a human!
          Ultra-low latency (~800ms), natural interruption, post-call analysis.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-400 text-sm">Total Calls</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_calls || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <PhoneIncoming className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">Inbound</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.inbound_calls || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <PhoneOutgoing className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Outbound</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.outbound_calls || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400 text-sm">Avg. Duration</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.avg_duration ? Math.round(stats.avg_duration) + 's' : '--'}
            </p>
          </div>
        </div>
      )}

      {/* Custom Voice Upload */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            ✨ Add Custom Voice
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Nom de la voix</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Ma voix CEO"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <label className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 ${
              uploading ? 'bg-gray-600' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
            } text-white`}>
              {uploading ? '⏳ Upload...' : '📁 Upload Audio'}
              <input
                type="file"
                accept="audio/*"
                onChange={handleUploadVoice}
                disabled={uploading || !uploadName}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">Formats: MP3, WAV, M4A (min 30 secondes recommandé)</p>
        </div>

        {/* Custom Voices List */}
        {customVoices.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">🎨 My Custom Voices</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {customVoices.map(voice => (
                <div 
                  key={voice.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVoice === voice.retell_voice_id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:border-orange-400'
                  }`}
                  onClick={() => setSelectedVoice(voice.retell_voice_id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{voice.voice_name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomVoice(voice.id); }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-xs text-orange-300">✨ Custom</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4">
          {agent ? '✅ Agent Configured' : '⚙️ Configure Agent'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nom de l'agent</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="Assistant Commercial"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Voix Retell</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select a voice...</option>
              <optgroup label="🎨 My Custom Voices">
                {customVoices.map(voice => (
                  <option key={voice.id} value={voice.retell_voice_id}>
                    ✨ {voice.voice_name} (Custom)
                  </option>
                ))}
              </optgroup>
              <optgroup label="📦 Voix Retell">
                {voices.map(voice => (
                  <option key={voice.voiceId} value={voice.voiceId}>
                    {voice.name} - {voice.language} ({voice.gender})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Message d'accueil</label>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            placeholder="Bonjour ! Comment puis-je vous aider ?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Instructions système (prompt)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
            placeholder="Tu es un assistant commercial pour [Entreprise]. Tu dois..."
          />
        </div>

        <button
          onClick={createAgent}
          disabled={loading || !selectedVoice}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {agent ? '🔄 Update' : '🚀 Créer l\'Agent'}
        </button>
      </div>

      {/* Phone Numbers */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📱 Phone Numbers</h3>
        
        {phoneNumbers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No number configured</p>
            <p className="text-sm text-gray-500">
              Buy a number via the Retell.ai dashboard to receive calls
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {phoneNumbers.map(num => (
              <div key={num.phone_number_id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{num.phone_number}</p>
                  <p className="text-sm text-gray-400">{num.nickname}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${num.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'}`}>
                  {num.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make Outbound Call */}
      {agent && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📞 Make a Call</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Number to call</label>
              <input
                type="tel"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="+33612345678"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Customer name (optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <button
            onClick={makeCall}
            disabled={calling || !callNumber || phoneNumbers.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {calling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Calling...
              </>
            ) : (
              <>
                <PhoneOutgoing className="w-4 h-4" />
                Start call
              </>
            )}
          </button>

          {phoneNumbers.length === 0 && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Configure a phone number first
            </p>
          )}
        </div>
      )}

      {/* Call History */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Call History</h3>
        
        {callHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No calls recorded</p>
        ) : (
          <div className="space-y-3">
            {callHistory.map(call => (
              <div key={call.call_id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {call.call_type === 'inbound' ? (
                      <PhoneIncoming className="w-4 h-4 text-green-400" />
                    ) : (
                      <PhoneOutgoing className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-white font-medium">
                      {call.customer_name || call.from_number || call.to_number}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    call.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    call.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-600 text-gray-400'
                  }`}>
                    {call.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>⏱️ {call.duration_seconds || 0}s</span>
                  {call.sentiment && <span>😊 {call.sentiment}</span>}
                  <span>{new Date(call.created_at).toLocaleString()}</span>
                </div>
                {call.summary && (
                  <p className="text-sm text-gray-300 mt-2 p-2 bg-gray-800 rounded">
                    {call.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Personality Cloner Panel
function PersonalityPanel({ sessionId }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [sampleMessages, setSampleMessages] = useState('');

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.get(`/advanced-ai/personality/profile/${sessionId}`),
        api.get(`/advanced-ai/personality/stats/${sessionId}`)
      ]);
      setProfile(profileRes.data.profile);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to load personality data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzePersonality = async () => {
    setAnalyzing(true);
    try {
      const messages = sampleMessages.split('\n').filter(m => m.trim());
      const res = await api.post('/advanced-ai/personality/analyze', {
        sessionId,
        messages: messages.length > 0 ? messages : undefined
      });
      setProfile(res.data.profile);
      alert(`✅ Personality analyzed! (${res.data.messagesAnalyzed} messages)`);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const generateResponse = async () => {
    if (!testMessage) return;
    setLoading(true);
    try {
      const res = await api.post('/advanced-ai/personality/generate', {
        sessionId,
        customerMessage: testMessage
      });
      setGeneratedResponse(res.data.response);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 rounded-xl p-6 border border-fuchsia-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Copy className="w-6 h-6 text-fuchsia-400" />
          Personality Cloner
        </h2>
        <p className="text-fuchsia-200 text-sm">
          🎭 AI analyzes your messages and learns to write EXACTLY like you.
          Same tone, same style, same expressions!
        </p>
      </div>

      {/* Profile Status */}
      {profile ? (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">✅ Profile Analyzed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-fuchsia-400">{profile.formality_score}/10</p>
              <p className="text-xs text-gray-400">Formality</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">{profile.humor_score}/10</p>
              <p className="text-xs text-gray-400">Humor</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-400">{profile.emoji_usage}</p>
              <p className="text-xs text-gray-400">Emojis</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-400">{profile.vocabulary_level}</p>
              <p className="text-xs text-gray-400">Vocabulary</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Style: {profile.writing_style}
          </p>
          {profile.common_phrases?.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-400 text-sm">Favorite expressions:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.common_phrases.slice(0, 5).map((phrase, i) => (
                  <span key={i} className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 rounded text-xs">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📝 Analyze your style</h3>
          <p className="text-gray-400 text-sm mb-4">
            Paste some of your messages (one per line) or leave empty to automatically analyze your WhatsApp messages.
          </p>
          <textarea
            value={sampleMessages}
            onChange={(e) => setSampleMessages(e.target.value)}
            placeholder="Salut ! Comment ça va ?&#10;Pas de souci, je m'en occupe 👍&#10;On se voit demain alors..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-32 mb-4"
          />
          <button
            onClick={analyzePersonality}
            disabled={analyzing}
            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {analyzing ? '🔄 Analyzing...' : '🎭 Analyze my personality'}
          </button>
        </div>
      )}

      {/* Test Generation */}
      {profile && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🧪 Test Clone</h3>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Customer message</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Bonjour, je voudrais des informations sur vos services"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <button
            onClick={generateResponse}
            disabled={loading || !testMessage}
            className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            ✨ Generate cloned response
          </button>
          
          {generatedResponse && (
            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Generated response (your style):</p>
              <p className="text-white">{generatedResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Churn Predictor Panel
function ChurnPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, riskRes, alertsRes] = await Promise.all([
        api.get(`/advanced-ai/churn/stats/${sessionId}`),
        api.get(`/advanced-ai/churn/at-risk/${sessionId}?minScore=30`),
        api.get(`/advanced-ai/churn/alerts/${sessionId}`)
      ]);
      setStats(statsRes.data.stats);
      setAtRisk(riskRes.data.customers || []);
      setAlerts(alertsRes.data.alerts || []);
    } catch (err) {
      console.error('Failed to load churn data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (alertId) => {
    try {
      await api.post(`/advanced-ai/churn/alerts/${alertId}/read`);
      loadData();
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-xl p-6 border border-rose-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-rose-400" />
          Churn Predictor
        </h2>
        <p className="text-rose-200 text-sm">
          🔮 Predicts which customers are likely to leave. Act before it's too late!
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-white">{stats.total_customers || 0}</p>
            <p className="text-xs text-gray-400">Clients analysés</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical_count || 0}</p>
            <p className="text-xs text-gray-400">🚨 Critiques</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.high_count || 0}</p>
            <p className="text-xs text-gray-400">⚠️ Hauts</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.medium_count || 0}</p>
            <p className="text-xs text-gray-400">📊 Moyens</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.low_count || 0}</p>
            <p className="text-xs text-gray-400">✅ Faibles</p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🚨 Alertes ({alerts.length})</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.alert_type === 'critical' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{alert.contact_name || alert.chat_id}</p>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ✓ Lu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* At Risk Customers */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">⚠️ At-Risk Customers</h3>
        {atRisk.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No at-risk customers detected 🎉</p>
        ) : (
          <div className="space-y-3">
            {atRisk.map(customer => (
              <div key={customer.chat_id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{customer.contact_name || customer.chat_id}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    customer.risk_level === 'critical' ? 'bg-red-500 text-white' :
                    customer.risk_level === 'high' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {customer.churn_score}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(customer.risk_factors || '[]').map((factor, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Multi-Agent Panel
function MultiAgentPanel({ sessionId }) {
  const [agents, setAgents] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentConfig, setAgentConfig] = useState({ name: '', triggers: '', systemPrompt: '' });

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsRes, statsRes] = await Promise.all([
        api.get(`/advanced-ai/agents/list/${sessionId}`),
        api.get(`/advanced-ai/agents/stats/${sessionId}`)
      ]);
      setAgents(agentsRes.data.agents || {});
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load multi-agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveAgent = async () => {
    if (!editingAgent) return;
    try {
      await api.post('/advanced-ai/agents/configure', {
        sessionId,
        agentType: editingAgent,
        config: {
          name: agentConfig.name,
          triggers: agentConfig.triggers.split(',').map(t => t.trim()).filter(Boolean),
          systemPrompt: agentConfig.systemPrompt
        }
      });
      alert('✅ Agent Configured !');
      setEditingAgent(null);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const agentColors = {
    sales: 'green',
    support: 'blue',
    booking: 'orange',
    general: 'gray'
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-6 border border-amber-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-amber-400" />
          Multi-Agent Handoff
        </h2>
        <p className="text-amber-200 text-sm">
          💬 Plusieurs agents IA spécialisés qui se passent le client intelligemment.
          Vente → Support → RDV, tout automatique !
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.agentDistribution?.map(dist => (
            <div key={dist.current_agent} className={`bg-${agentColors[dist.current_agent] || 'gray'}-500/10 rounded-lg p-4 border border-${agentColors[dist.current_agent] || 'gray'}-500/30`}>
              <p className="text-2xl font-bold text-white">{dist.conversation_count}</p>
              <p className="text-xs text-gray-400">{agents[dist.current_agent]?.name || dist.current_agent}</p>
            </div>
          ))}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-2xl font-bold text-amber-400">{stats.totalHandoffs || 0}</p>
            <p className="text-xs text-gray-400">Handoffs total</p>
          </div>
        </div>
      )}

      {/* Agents Configuration */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🤖 Agents Configureds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(agents).map(([type, agent]) => (
            <div key={type} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.icon}</span>
                  <span className="font-medium text-white">{agent.name}</span>
                </div>
                <button
                  onClick={() => {
                    setEditingAgent(type);
                    setAgentConfig({
                      name: agent.name,
                      triggers: agent.triggers?.join(', ') || '',
                      systemPrompt: agent.systemPrompt || ''
                    });
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  ✏️ Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.triggers?.slice(0, 5).map((trigger, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="bg-gray-800 rounded-xl p-6 border border-amber-500">
          <h3 className="text-lg font-semibold text-white mb-4">
            ✏️ Configure {agents[editingAgent]?.name || editingAgent}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom de l'agent</label>
              <input
                type="text"
                value={agentConfig.name}
                onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mots-clés déclencheurs (séparés par virgule)</label>
              <input
                type="text"
                value={agentConfig.triggers}
                onChange={(e) => setAgentConfig({ ...agentConfig, triggers: e.target.value })}
                placeholder="prix, tarif, acheter, commander"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Instructions système</label>
              <textarea
                value={agentConfig.systemPrompt}
                onChange={(e) => setAgentConfig({ ...agentConfig, systemPrompt: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-32"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveAgent}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg"
              >
                💾 Save
              </button>
              <button
                onClick={() => setEditingAgent(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Competitor Spy Panel
function CompetitorSpyPanel({ sessionId }) {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [intel, setIntel] = useState({ competitors: [], recentMessages: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) loadIntel();
  }, [sessionId]);

  const loadIntel = async () => {
    try {
      const res = await api.get(`/advanced-ai/competitor/intelligence/${sessionId}`);
      setIntel(res.data);
    } catch (err) {}
  };

  const analyzeMessage = async () => {
    if (!message) return;
    setLoading(true);
    try {
      const res = await api.post('/advanced-ai/competitor/analyze', { sessionId, message });
      setAnalysis(res.data.analysis);
      loadIntel();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-xl p-6 border border-slate-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Eye className="w-6 h-6 text-slate-400" />
          Competitor Spy
        </h2>
        <p className="text-slate-200 text-sm">
          🕵️ Paste a competitor message your client forwarded. AI analyzes it and tells you how to do better!
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste competitor message here..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-32 mb-4"
        />
        <button onClick={analyzeMessage} disabled={loading || !message}
          className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
          {loading ? '🔍 Analyzing...' : '🕵️ Analyze'}
        </button>
      </div>

      {analysis && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Analyse</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-xs">Competitor</p>
              <p className="text-white font-medium">{analysis.competitor_name}</p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-xs">Menace</p>
              <p className={`font-medium ${analysis.competitive_threat_level === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                {analysis.competitive_threat_level}
              </p>
            </div>
          </div>
          {analysis.suggested_response && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm font-medium mb-1">💡 Réponse suggérée:</p>
              <p className="text-white">{analysis.suggested_response}</p>
            </div>
          )}
        </div>
      )}

      {intel.competitors.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🏢 Competitors Détectés</h3>
          <div className="space-y-2">
            {intel.competitors.map(c => (
              <div key={c.competitor_name} className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-white">{c.competitor_name}</span>
                <span className="text-gray-400">{c.total_mentions} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Visual Product Finder Panel
function VisualFinderPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        api.get(`/advanced-ai/visual/stats/${sessionId}`),
        api.get(`/advanced-ai/visual/products/${sessionId}`)
      ]);
      setStats(statsRes.data.stats);
      setProducts(productsRes.data.products || []);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl p-6 border border-teal-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Camera className="w-6 h-6 text-teal-400" />
          Visual Product Finder
        </h2>
        <p className="text-teal-200 text-sm">
          📸 Customer sends a photo → AI finds similar product in your catalog!
          Requires OpenAI for image analysis.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-teal-400">{stats.total_products || 0}</p>
            <p className="text-xs text-gray-400">Products in catalog</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-cyan-400">{stats.total_searches || 0}</p>
            <p className="text-xs text-gray-400">Recherches</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-400">{Math.round(stats.avg_confidence || 0)}%</p>
            <p className="text-xs text-gray-400">Confiance moy.</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📦 Catalog ({products.length} products)</h3>
        {products.length === 0 ? (
          <p className="text-gray-400">Import your products to enable visual search</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.slice(0, 8).map(p => (
              <div key={p.product_id} className="p-3 bg-gray-700/50 rounded-lg">
                <p className="text-white text-sm font-medium truncate">{p.name}</p>
                <p className="text-teal-400 text-sm">{p.price}€</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Smart Broadcast Panel
function SmartBroadcastPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        api.get(`/advanced-ai/broadcast/stats/${sessionId}`),
        api.get(`/advanced-ai/broadcast/campaigns/${sessionId}`)
      ]);
      setStats(statsRes.data.stats);
      setCampaigns(campaignsRes.data.campaigns || []);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl p-6 border border-sky-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Send className="w-6 h-6 text-sky-400" />
          Smart Broadcast
        </h2>
        <p className="text-sky-200 text-sm">
          🎯 AI learns when each customer is most receptive and sends at the optimal time!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-sky-400">{stats.total_campaigns || 0}</p>
            <p className="text-xs text-gray-400">Campagnes</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.segmented_customers || 0}</p>
            <p className="text-xs text-gray-400">Clients segmentés</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {stats.avg_response_rate ? (stats.avg_response_rate * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-gray-400">Taux réponse moy.</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📢 Campagnes</h3>
        {campaigns.length === 0 ? (
          <p className="text-gray-400">Noe campagne créée</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id} className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-white">{c.campaign_name}</span>
                <span className={`px-2 py-1 rounded text-xs ${c.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Analytics Panel
function AnalyticsPanel({ sessionId }) {
  const [summary, setSummary] = useState(null);
  const [bestTimes, setBestTimes] = useState([]);
  const [topWords, setTopWords] = useState([]);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [summaryRes, timesRes, wordsRes] = await Promise.all([
        api.get(`/advanced-ai/analytics/dashboard/${sessionId}`),
        api.get(`/advanced-ai/analytics/best-times/${sessionId}`),
        api.get(`/advanced-ai/analytics/top-words/${sessionId}?limit=10`)
      ]);
      setSummary(summaryRes.data.summary);
      setBestTimes(timesRes.data.times || []);
      setTopWords(wordsRes.data.words || []);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-6 border border-violet-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-violet-400" />
          Conversation Analytics
        </h2>
        <p className="text-violet-200 text-sm">
          📊 Insights profonds sur vos conversations. Découvrez ce qui convertit !
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-violet-400">{summary.total_sent || 0}</p>
            <p className="text-xs text-gray-400">Messages envoyés</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-purple-400">{summary.total_received || 0}</p>
            <p className="text-xs text-gray-400">Messages reçus</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-400">{summary.total_conversions || 0}</p>
            <p className="text-xs text-gray-400">Conversions</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-400">{summary.peakHour || '--'}h</p>
            <p className="text-xs text-gray-400">Heure de pointe</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">⏰ Meilleurs Moments</h3>
          {bestTimes.length === 0 ? (
            <p className="text-gray-400">Pas assez de données</p>
          ) : (
            <div className="space-y-2">
              {bestTimes.slice(0, 5).map((t, i) => (
                <div key={i} className="flex justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-white">{t.day} {t.hour}</span>
                  <span className="text-violet-400">{t.avgPerDay}/jour</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🔤 Mots qui Convertissent</h3>
          {topWords.length === 0 ? (
            <p className="text-gray-400">Pas assez de données</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topWords.map((w, i) => (
                <span key={i} className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                  {w.word} ({w.conversion_pct}%)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Deal Closer Panel
function DealCloserPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, offersRes, analyticsRes] = await Promise.all([
        api.get(`/advanced-ai/deal/stats/${sessionId}`),
        api.get(`/advanced-ai/deal/offers/${sessionId}`),
        api.get(`/advanced-ai/deal/analytics/${sessionId}`)
      ]);
      setStats(statsRes.data.stats);
      setOffers(offersRes.data.offers || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-lime-500/20 to-green-500/20 rounded-xl p-6 border border-lime-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Award className="w-6 h-6 text-lime-400" />
          Deal Closer
        </h2>
        <p className="text-lime-200 text-sm">
          🤝 AI detects when customer hesitates and suggests the right offer to close!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-lime-400">{stats.total_hesitations || 0}</p>
            <p className="text-xs text-gray-400">Hesitations detected</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.converted || 0}</p>
            <p className="text-xs text-gray-400">Convertis</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active_offers || 0}</p>
            <p className="text-xs text-gray-400">Offres actives</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🎁 Offres de Closing</h3>
        {offers.length === 0 ? (
          <p className="text-gray-400">Ajoutez des offres pour que l'IA puisse les proposer</p>
        ) : (
          <div className="space-y-2">
            {offers.map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{o.offer_name}</p>
                  <p className="text-sm text-gray-400">
                    {o.discount_percent ? `${o.discount_percent}% off` : `${o.discount_amount}€ off`}
                  </p>
                </div>
                <span className="text-lime-400">{o.success_rate || 0}% succès</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Auto Documentation Panel
function AutoDocsPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, faqsRes, pendingRes] = await Promise.all([
        api.get(`/advanced-ai/docs/stats/${sessionId}`),
        api.get(`/advanced-ai/docs/faqs/${sessionId}`),
        api.get(`/advanced-ai/docs/pending/${sessionId}`)
      ]);
      setStats(statsRes.data.stats);
      setFaqs(faqsRes.data.faqs || []);
      setPending(pendingRes.data.questions || []);
    } catch (err) {}
  };

  const generateFromFrequent = async () => {
    setLoading(true);
    try {
      await api.post('/advanced-ai/docs/generate-from-frequent', { sessionId });
      alert('✅ FAQs générées !');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl p-6 border border-orange-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-400" />
          Auto Documentation
        </h2>
        <p className="text-orange-200 text-sm">
          📝 AI automatically generates FAQ and documentation from your conversations!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.total_faqs || 0}</p>
            <p className="text-xs text-gray-400">FAQs générées</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.total_articles || 0}</p>
            <p className="text-xs text-gray-400">Articles</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending_questions || 0}</p>
            <p className="text-xs text-gray-400">Questions en attente</p>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">❓ Frequently Asked Questions Detected</h3>
            <button onClick={generateFromFrequent} disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              {loading ? '⏳' : '✨ Generate FAQs'}
            </button>
          </div>
          <div className="space-y-2">
            {pending.slice(0, 5).map(q => (
              <div key={q.id} className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-white">{q.question_pattern}</span>
                <span className="text-orange-400">{q.frequency}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📚 FAQs</h3>
        {faqs.length === 0 ? (
          <p className="text-gray-400">Noe FAQ générée</p>
        ) : (
          <div className="space-y-3">
            {faqs.slice(0, 5).map(f => (
              <div key={f.id} className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium mb-2">Q: {f.question}</p>
                <p className="text-gray-300 text-sm">R: {f.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// CRM Sync Panel
function CRMSyncPanel({ sessionId }) {
  const [stats, setStats] = useState(null);
  const [connections, setConnections] = useState([]);
  const [supportedCRMs, setSupportedCRMs] = useState({});

  useEffect(() => {
    if (sessionId) loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const [statsRes, connectionsRes, crmsRes] = await Promise.all([
        api.get(`/advanced-ai/crm/stats/${sessionId}`),
        api.get(`/advanced-ai/crm/connections/${sessionId}`),
        api.get('/advanced-ai/crm/supported')
      ]);
      setStats(statsRes.data.stats);
      setConnections(connectionsRes.data.connections || []);
      setSupportedCRMs(crmsRes.data.crms || {});
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-cyan-400" />
          CRM Sync
        </h2>
        <p className="text-cyan-200 text-sm">
          🌐 Bidirectional sync with your favorite CRMs. Contacts and conversations auto-sync!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-cyan-400">{stats.connectedCRMs || 0}</p>
            <p className="text-xs text-gray-400">CRMs connectés</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.syncedContacts || 0}</p>
            <p className="text-xs text-gray-400">Synced contacts</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🔗 CRMs Supportés</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(supportedCRMs).map(([key, crm]) => {
            const isConnected = connections.some(c => c.crm_type === key);
            return (
              <div key={key} className={`p-4 rounded-lg border text-center ${
                isConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/50 border-gray-600'
              }`}>
                <span className="text-3xl">{crm.icon}</span>
                <p className="text-white font-medium mt-2">{crm.name}</p>
                <p className={`text-xs mt-1 ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                  {isConnected ? '✓ Connecté' : 'Non connecté'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {connections.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Connexions Actives</h3>
          <div className="space-y-2">
            {connections.map(c => (
              <div key={c.crm_type} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{supportedCRMs[c.crm_type]?.icon}</span>
                  <span className="text-white">{supportedCRMs[c.crm_type]?.name}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  Sync: {c.last_sync ? new Date(c.last_sync).toLocaleDateString() : 'Jamais'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
