import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ai, whatsapp } from '../services/api';
import { Bot, Settings, Key, MessageSquare, Clock, Send, CheckCircle, XCircle, Sparkles, User, Building, Globe, Zap, Shield, AlertTriangle, Target, TrendingUp, Users, DollarSign, Filter, Bell } from 'lucide-react';

export default function AIConfig() {
  const [selectedSession, setSelectedSession] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState({
    enabled: false,
    aiEnabled: true,
    persona: 'executive',
    name: '',
    role: 'CEO',
    company: '',
    language: 'fr',
    tone: 'professional',
    customInstructions: '',
    autoReplyEnabled: false,
    autoReplyMessage: '',
    autoReplyKeywords: [],
    workingHours: { enabled: false, start: '09:00', end: '18:00' },
    awayMessage: '',
    // WhatsApp Advanced Features
    suggestionMode: true, // AI suggests, human approves
    autoSendMode: false, // AI sends automatically (dangerous!)
    requireApproval: true, // Always require human approval
    leadQualification: { enabled: false, questions: [] },
    opportunityDetection: { enabled: false, keywords: [] },
    priceNegotiation: { enabled: false, minPrice: '', maxPrice: '', requireApproval: true },
    appointmentBooking: { enabled: false, requireApproval: true },
    urgentAlerts: { enabled: false, keywords: [] },
    customerSegmentation: { enabled: false, vip: [], regular: [], cold: [] },
    responseDelay: { enabled: false, minSeconds: 3, maxSeconds: 10 },
    typingIndicator: true,
    readReceipts: true,
    smartFollowUp: { enabled: false, hours: 24, message: '' },
    competitorMentions: { enabled: false, competitors: [], response: '' }
  });

  const { data: aiStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => ai.getStatus().then(res => res.data),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
  });

  const { data: sessionConfig, refetch: refetchConfig } = useQuery({
    queryKey: ['ai-config', selectedSession],
    queryFn: () => ai.getConfig(selectedSession).then(res => res.data),
    enabled: !!selectedSession,
  });

  useEffect(() => {
    if (sessionConfig?.config) {
      setConfig(prev => ({ ...prev, ...sessionConfig.config }));
    }
  }, [sessionConfig]);

  const initializeMutation = useMutation({
    mutationFn: (key) => ai.initialize(key),
    onSuccess: () => {
      refetchStatus();
      setMessage({ type: 'success', text: 'AI initialized successfully!' });
      setApiKey('');
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to initialize AI' });
    }
  });

  const saveConfigMutation = useMutation({
    mutationFn: () => ai.setConfig(selectedSession, config),
    onSuccess: () => {
      refetchConfig();
      setMessage({ type: 'success', text: 'Configuration saved!' });
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save configuration' });
    }
  });

  const testMutation = useMutation({
    mutationFn: () => ai.testResponse(testMessage, config),
    onSuccess: (res) => {
      setTestResponse(res.data.response);
    },
    onError: (err) => {
      setTestResponse(`Error: ${err.response?.data?.error || 'Test failed'}`);
    }
  });

  const sessions = sessionsData?.sessions || [];

  const personas = [
    { value: 'executive', label: '👔 Executive (CEO/Director)', desc: 'Strategic vision, decisive leadership' },
    { value: 'president', label: '🏛️ President', desc: 'Institutional authority, diplomatic' },
    { value: 'diplomat', label: '🤝 Diplomat', desc: 'Negotiation expert, multicultural' },
    { value: 'assistant', label: '📋 Executive Assistant', desc: 'Efficient, organized, professional' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
  ];

  const languages = [
    { value: 'fr', label: '🇫🇷 French' },
    { value: 'en', label: '🇬🇧 English' },
    { value: 'es', label: '🇪🇸 Spanish' },
    { value: 'de', label: '🇩🇪 German' },
    { value: 'it', label: '🇮🇹 Italian' },
    { value: 'pt', label: '🇵🇹 Portuguese' },
    { value: 'ar', label: '🇸🇦 Arabic' },
    { value: 'auto', label: '🌐 Auto-detect' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI Chatbot</h1>
          <p className="text-gray-400">Executive-level AI assistant for WhatsApp</p>
        </div>
      </div>

      {/* API Key Expiration Reminder */}
      <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-l-4 border-orange-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-300 mb-1">
              🔔 AI Assistant - Claude (Anthropic)
            </h3>
            <p className="text-sm text-orange-200 mb-2">
              <strong>Powered by Claude AI</strong>
            </p>
            <p className="text-xs text-orange-300/80">
              L'assistant IA utilise Claude d'Anthropic pour générer des réponses intelligentes.
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
        </div>
      )}

      {/* API Key Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Claude API (Anthropic)</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${aiStatus?.initialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {aiStatus?.initialized ? '✓ Connected' : '✗ Not Connected'}
          </span>
        </div>
        
        {!aiStatus?.initialized && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              />
              <button
                onClick={() => initializeMutation.mutate(apiKey)}
                disabled={!apiKey || initializeMutation.isPending}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {initializeMutation.isPending ? 'Connecting...' : 'Connect'}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              💡 <strong className="text-gray-300">Claude AI</strong> - Obtenez votre clé sur{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-medium">
                console.anthropic.com
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Session Selection */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Configure Session</h2>
        </div>
        
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
        >
          <option value="">Select a WhatsApp session...</option>
          {sessions.length === 0 ? (
            <option value="" disabled>No WhatsApp sessions available - Create one first</option>
          ) : (
            sessions.map(session => (
              <option key={session.sessionId} value={session.sessionId}>
                {session.name} {session.phoneNumber ? `(+${session.phoneNumber})` : ''} - {session.status}
              </option>
            ))
          )}
        </select>
        
        {sessions.length === 0 && (
          <p className="mt-2 text-sm text-yellow-400">
            ⚠️ No WhatsApp sessions found. Please create a WhatsApp session first in the WhatsApp page.
          </p>
        )}
      </div>

      {selectedSession && (
        <>
          {/* Main Toggle */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">AI Assistant</h3>
                  <p className="text-purple-100">Enable intelligent auto-responses</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-purple-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-gray-200 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-200"></div>
              </label>
            </div>
          </div>

          {/* Persona Configuration */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">AI Persona</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {personas.map(p => (
                <button
                  key={p.value}
                  onClick={() => setConfig({ ...config, persona: p.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${config.persona === p.value ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600 hover:border-gray-500'}`}
                >
                  <div className="font-medium text-white">{p.label}</div>
                  <div className="text-sm text-gray-400">{p.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" /> Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role/Title</label>
                <input
                  type="text"
                  value={config.role}
                  onChange={(e) => setConfig({ ...config, role: e.target.value })}
                  placeholder="CEO, President, Director..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" /> Company
                </label>
                <input
                  type="text"
                  value={config.company}
                  onChange={(e) => setConfig({ ...config, company: e.target.value })}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" /> Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                >
                  {languages.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
              <div className="flex gap-2 flex-wrap">
                {tones.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setConfig({ ...config, tone: t.value })}
                    className={`px-4 py-2 rounded-lg border transition-all ${config.tone === t.value ? 'border-purple-500 bg-purple-500/20 text-purple-400' : 'border-gray-600 hover:border-gray-500 text-gray-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Instructions</label>
              <textarea
                value={config.customInstructions}
                onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                placeholder="Add specific instructions for the AI... (e.g., 'Always mention our new product launch', 'Redirect sales inquiries to sales@company.com')"
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Working Hours</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.workingHours?.enabled}
                  onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {config.workingHours?.enabled && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start</label>
                    <input
                      type="time"
                      value={config.workingHours?.start || '09:00'}
                      onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End</label>
                    <input
                      type="time"
                      value={config.workingHours?.end || '18:00'}
                      onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Away Message (outside hours)</label>
                  <textarea
                    value={config.awayMessage}
                    onChange={(e) => setConfig({ ...config, awayMessage: e.target.value })}
                    placeholder="Thank you for your message. Our office hours are 9am-6pm. We will respond as soon as possible."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto-Reply Keywords */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Auto-Reply (Keywords)</h2>
                  <p className="text-xs text-gray-400">Send automatic responses for specific keywords</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoReplyEnabled}
                  onChange={(e) => setConfig({ ...config, autoReplyEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {config.autoReplyEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.autoReplyKeywords?.join(', ') || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      autoReplyKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                    })}
                    placeholder="price, pricing, tarif, cost, combien, how much"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    💡 When a message contains any of these keywords, send the auto-reply below
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-Reply Message
                  </label>
                  <textarea
                    value={config.autoReplyMessage}
                    onChange={(e) => setConfig({ ...config, autoReplyMessage: e.target.value })}
                    placeholder="Thank you for your interest! Our pricing starts at $99/month. For a detailed quote, please contact sales@company.com or call +1-555-0123."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    <strong>ℹ️ How it works:</strong> If a message contains any keyword (e.g., "What's your price?"), 
                    the auto-reply is sent instantly. For other messages, the full AI responds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full AI Toggle */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Full AI Responses</h2>
                  <p className="text-xs text-gray-400">Use AI for all messages (not just keywords)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aiEnabled}
                  onChange={(e) => setConfig({ ...config, aiEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="mt-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-300">
                <strong>⚠️ Note:</strong> If disabled, only auto-reply keywords will trigger responses. 
                If enabled, AI responds to ALL messages intelligently.
              </p>
            </div>
          </div>

          {/* Test Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Test AI Response</h2>
            </div>
            
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
              <button
                onClick={() => testMutation.mutate()}
                disabled={!testMessage || testMutation.isPending || !aiStatus?.initialized}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {testMutation.isPending ? 'Testing...' : 'Test'}
              </button>
            </div>

            {testResponse && (
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400 mb-1">AI Response:</div>
                <div className="text-white">{testResponse}</div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => saveConfigMutation.mutate()}
              disabled={saveConfigMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
