import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agents as agentsApi, analytics, auth, whatsapp } from '../services/api';
import { Users, Phone, Globe, Zap, Shield, Lock, Eye, EyeOff, CheckCircle, XCircle, UserPlus, X, Key, QrCode } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Settings() {
  const t = useTranslation();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    languages: '',
    countries: ''
  });
  const [showNewAgentPassword, setShowNewAgentPassword] = useState(false);
  const [createAgentMessage, setCreateAgentMessage] = useState({ type: '', text: '' });

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState({ type: '', text: '' });

  // WhatsApp session management
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [createSessionMessage, setCreateSessionMessage] = useState({ type: '', text: '' });

  const queryClient = useQueryClient();

  const { data: agentInfo } = useQuery({
    queryKey: ['me'],
    queryFn: () => agentsApi.getMe().then(res => res.data),
  });

  const { data: allAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.getAll().then(res => res.data),
    enabled: agentInfo?.role === 'admin' || agentInfo?.role === 'super_admin',
  });

  const { data: agentStats } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: () => analytics.getAgents().then(res => res.data),
  });

  // WhatsApp sessions
  const { data: whatsappData, refetch: refetchWhatsappSessions } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
    refetchInterval: 10000,
  });

  const whatsappSessions = whatsappData?.sessions || [];
  const whatsappStats = whatsappData?.stats || null;

  const createSessionMutation = useMutation({
    mutationFn: (name) => whatsapp.createSession(name),
    onSuccess: () => {
      refetchWhatsappSessions();
      setShowCreateSessionModal(false);
      setNewSessionName('');
      setCreateSessionMessage({ type: 'success', text: 'WhatsApp session created! Please scan the QR code.' });
      setTimeout(() => setCreateSessionMessage({ type: '', text: '' }), 5000);
    },
    onError: (error) => {
      setCreateSessionMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to create session'
      });
    },
  });

  const disconnectSessionMutation = useMutation({
    mutationFn: (sessionId) => whatsapp.disconnectSession(sessionId),
    onSuccess: () => {
      refetchWhatsappSessions();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => whatsapp.deleteSession(sessionId),
    onSuccess: () => {
      refetchWhatsappSessions();
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: (data) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      setShowCreateAgentModal(false);
      setNewAgent({ name: '', email: '', password: '', role: 'agent', languages: '', countries: '' });
      setCreateAgentMessage({ type: 'success', text: 'Agent created successfully!' });
      setTimeout(() => setCreateAgentMessage({ type: '', text: '' }), 5000);
    },
    onError: (error) => {
      setCreateAgentMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to create agent'
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => agentsApi.resetPassword(id, newPassword),
    onSuccess: () => {
      setShowResetPasswordModal(false);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      setResetPasswordMessage({ type: 'success', text: `Password reset successfully for ${selectedAgent?.email}` });
      setTimeout(() => setResetPasswordMessage({ type: '', text: '' }), 5000);
    },
    onError: (error) => {
      setResetPasswordMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to reset password'
      });
    },
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setChangingPassword(true);
    try {
      await auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to change password'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (newAgent.password.length < 6) {
      setCreateAgentMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    createAgentMutation.mutate(newAgent);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword.length < 6) {
      setResetPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    resetPasswordMutation.mutate({ id: selectedAgent.id, newPassword: resetPasswordData.newPassword });
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      setCreateSessionMessage({ type: 'error', text: 'Session name is required' });
      return;
    }
    createSessionMutation.mutate(newSessionName);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{t('settings.title')}</h1>
        <p className="text-gray-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Change Password Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('settings.changePassword')}</h2>
            <p className="text-sm text-gray-400">{t('settings.changePasswordDesc')}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings.currentPassword')}</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all text-white placeholder-gray-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings.newPassword')}</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all text-white placeholder-gray-500"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings.confirmPassword')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all text-white placeholder-gray-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {passwordMessage.text && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${passwordMessage.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-red-500/20 border border-red-500/30'
              }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={`text-sm font-medium ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                {passwordMessage.text}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {changingPassword ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Changing Password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{t('settings.agentProfile')}</h2>
              <p className="text-sm text-gray-400">{t('settings.agentProfileDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name - Read only for clients */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('settings.name')}
                {agentInfo?.role !== 'super_admin' && (
                  <span className="ml-2 text-xs text-yellow-400">(Cannot be changed)</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">{agentInfo?.name}</p>
                {agentInfo?.role !== 'super_admin' && (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('settings.email')}</label>
              <p className="text-white">{agentInfo?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('settings.role')}</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${agentInfo?.role === 'super_admin'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-green-500/20 text-green-400'
                }`}>
                {agentInfo?.role === 'super_admin' ? '👑 Super Admin' : agentInfo?.role}
              </span>
            </div>
            {agentInfo?.role !== 'super_admin' && (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="text-blue-400">ℹ️</span>
                  <p className="text-sm text-blue-300">
                    To request changes to your account, please contact the administrator.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Limits for clients */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {agentInfo?.role === 'super_admin' ? 'Platform Status' : 'Your Limits'}
              </h2>
              <p className="text-sm text-gray-400">
                {agentInfo?.role === 'super_admin' ? 'System information' : 'Account restrictions'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {agentInfo?.role !== 'super_admin' ? (
              <>
                {/* Client limits */}
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">WhatsApp Sessions</span>
                  </div>
                  <span className="text-sm text-white font-medium">Max 5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Send Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 font-medium">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Message Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-400 font-medium">Active</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Admin stats */}
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">WhatsApp API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 font-medium">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Multi-Country</span>
                  </div>
                  <span className="text-sm text-white font-medium">20+ Countries</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Client Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Sessions Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">WhatsApp Accounts</h2>
              <p className="text-sm text-gray-400">Manage multiple WhatsApp connections</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const quickName = `WhatsApp Session ${Date.now()}`;
                createSessionMutation.mutate(quickName);
              }}
              disabled={whatsappStats?.available <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Quick connect - Auto-detect name from WhatsApp"
            >
              <QrCode className="w-4 h-4" />
              Quick Connect
            </button>
            <button
              onClick={() => setShowCreateSessionModal(true)}
              disabled={whatsappStats?.available <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title={whatsappStats?.available <= 0 ? 'Maximum sessions reached' : 'Add with custom name'}
            >
              <UserPlus className="w-4 h-4" />
              Custom Name
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        {whatsappStats && (
          <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{whatsappStats.total}</div>
                <div className="text-xs text-gray-400 uppercase">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{whatsappStats.connected}</div>
                <div className="text-xs text-gray-400 uppercase">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{whatsappStats.connecting}</div>
                <div className="text-xs text-gray-400 uppercase">Connecting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{whatsappStats.disconnected}</div>
                <div className="text-xs text-gray-400 uppercase">Disconnected</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${whatsappStats.available <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                  {whatsappStats.available}/{whatsappStats.maxAllowed}
                </div>
                <div className="text-xs text-gray-400 uppercase">Available</div>
              </div>
            </div>

            {whatsappStats.available <= 2 && whatsappStats.available > 0 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <span className="text-yellow-400">⚠️</span>
                <p className="text-sm text-yellow-300">
                  <strong>Warning:</strong> Only {whatsappStats.available} slot{whatsappStats.available !== 1 ? 's' : ''} remaining.
                </p>
              </div>
            )}

            {whatsappStats.available <= 0 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <span className="text-red-400">🚫</span>
                <p className="text-sm text-red-300">
                  <strong>Limit Reached:</strong> Maximum of {whatsappStats.maxAllowed} sessions.
                </p>
              </div>
            )}
          </div>
        )}

        {createSessionMessage.text && (
          <div className={`m-6 mb-0 flex items-center gap-3 p-4 rounded-lg ${createSessionMessage.type === 'success'
            ? 'bg-green-500/20 border border-green-500/30'
            : 'bg-red-500/20 border border-red-500/30'
            }`}>
            {createSessionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={`text-sm font-medium ${createSessionMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
              {createSessionMessage.text}
            </p>
          </div>
        )}

        <div className="p-6 space-y-4">
          {whatsappSessions && whatsappSessions.length > 0 ? (
            whatsappSessions.map((session) => (
              <div key={session.sessionId} className="bg-gray-700 rounded-lg border border-gray-600 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.status === 'connected' ? 'bg-green-500/20' :
                      session.status === 'connecting' ? 'bg-yellow-500/20' :
                        'bg-gray-600'
                      }`}>
                      <Phone className={`w-6 h-6 ${session.status === 'connected' ? 'text-green-400' :
                        session.status === 'connecting' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{session.name}</h3>
                      {session.phoneNumber && (
                        <p className="text-sm text-gray-400 mt-1">+{session.phoneNumber}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${session.status === 'connected' ? 'bg-green-500 animate-pulse' :
                          session.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            'bg-gray-500'
                          }`}></div>
                        <span className={`text-xs font-medium ${session.status === 'connected' ? 'text-green-400' :
                          session.status === 'connecting' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                          {session.status === 'connected' ? 'Connected' :
                            session.status === 'connecting' ? 'Connecting...' :
                              'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {session.status === 'connected' && (
                      <button
                        onClick={() => disconnectSessionMutation.mutate(session.sessionId)}
                        disabled={disconnectSessionMutation.isPending}
                        className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete WhatsApp account "${session.name}"?`)) {
                          deleteSessionMutation.mutate(session.sessionId);
                        }
                      }}
                      disabled={deleteSessionMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {session.status === 'connecting' && session.hasQR && session.qrCode && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Scan to Connect</span>
                    </div>
                    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                      <img
                        src={session.qrCode}
                        alt="WhatsApp QR Code"
                        className="w-48 h-48"
                      />
                      <p className="text-xs text-gray-600 mt-3 text-center max-w-xs">
                        Open WhatsApp → Menu → Linked Devices → Link a Device → Scan this code
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No WhatsApp Accounts</h3>
              <p className="text-gray-400 mb-4">Connect your WhatsApp account by scanning a QR code</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    const quickName = `WhatsApp Session ${Date.now()}`;
                    createSessionMutation.mutate(quickName);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                >
                  <QrCode className="w-5 h-5" />
                  Quick Connect
                </button>
                <button
                  onClick={() => setShowCreateSessionModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Custom Name
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agents List (Admin Only) */}
      {
        ['admin', 'super_admin'].includes(agentInfo?.role) && (
          <>
            {createAgentMessage.text && (
              <div className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${createAgentMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
                }`}>
                {createAgentMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-sm font-medium ${createAgentMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {createAgentMessage.text}
                </p>
              </div>
            )}
            {resetPasswordMessage.text && (
              <div className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${resetPasswordMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
                }`}>
                {resetPasswordMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-sm font-medium ${resetPasswordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {resetPasswordMessage.text}
                </p>
              </div>
            )}
          </>
        )
      }

      {
        ['admin', 'super_admin'].includes(agentInfo?.role) && allAgents && (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Team Members</h2>
              <button
                onClick={() => setShowCreateAgentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Add Agent
              </button>
            </div>

            <div className="divide-y divide-gray-700">
              {allAgents.map((agent) => (
                <div key={agent.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{agent.name}</p>
                      <p className="text-sm text-gray-400">{agent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${agent.role === 'admin' || agent.role === 'super_admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-gray-600 text-gray-300'
                      }`}>
                      {agent.role}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowResetPasswordModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Create Agent Modal */}
      {
        showCreateAgentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Agent</h3>
                <button
                  onClick={() => setShowCreateAgentModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="Agent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="agent@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showNewAgentPassword ? "text" : "password"}
                      required
                      value={newAgent.password}
                      onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAgentPassword(!showNewAgentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showNewAgentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={newAgent.role}
                    onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white"
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Languages (optional)</label>
                  <input
                    type="text"
                    value={newAgent.languages}
                    onChange={(e) => setNewAgent({ ...newAgent, languages: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="e.g., English, French, Spanish"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Countries (optional)</label>
                  <input
                    type="text"
                    value={newAgent.countries}
                    onChange={(e) => setNewAgent({ ...newAgent, countries: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="e.g., US, UK, FR"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Agent
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* Reset Password Modal */}
      {
        showResetPasswordModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-400 mb-4">
                Reset password for <strong className="text-white">{selectedAgent.email}</strong>
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      required
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all text-white placeholder-gray-400"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* Create Session Modal */}
      {
        showCreateSessionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Add WhatsApp Account</h3>
                <button
                  onClick={() => setShowCreateSessionModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Name</label>
                  <input
                    type="text"
                    required
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="e.g., Support Line, Sales Team"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Create & Get QR Code
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
