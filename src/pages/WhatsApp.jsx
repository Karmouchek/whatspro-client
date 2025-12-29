import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { whatsapp } from '../services/api';
import { Phone, QrCode, CheckCircle, XCircle, UserPlus, X, Smartphone, Hash, RefreshCw, Globe, Trash2 } from 'lucide-react';

// Phone prefix to country ISO code mapping
const phoneToCountry = {
  '1': { iso: 'us', name: 'USA/Canada' },      // USA/Canada
  '7': { iso: 'ru', name: 'Russia' },          // Russia
  '20': { iso: 'eg', name: 'Egypt' },
  '27': { iso: 'za', name: 'South Africa' },
  '30': { iso: 'gr', name: 'Greece' },
  '31': { iso: 'nl', name: 'Netherlands' },
  '32': { iso: 'be', name: 'Belgium' },
  '33': { iso: 'fr', name: 'France' },
  '34': { iso: 'es', name: 'Spain' },
  '36': { iso: 'hu', name: 'Hungary' },
  '39': { iso: 'it', name: 'Italy' },
  '40': { iso: 'ro', name: 'Romania' },
  '41': { iso: 'ch', name: 'Switzerland' },
  '43': { iso: 'at', name: 'Austria' },
  '44': { iso: 'gb', name: 'UK' },
  '45': { iso: 'dk', name: 'Denmark' },
  '46': { iso: 'se', name: 'Sweden' },
  '47': { iso: 'no', name: 'Norway' },
  '48': { iso: 'pl', name: 'Poland' },
  '49': { iso: 'de', name: 'Germany' },
  '51': { iso: 'pe', name: 'Peru' },
  '52': { iso: 'mx', name: 'Mexico' },
  '53': { iso: 'cu', name: 'Cuba' },
  '54': { iso: 'ar', name: 'Argentina' },
  '55': { iso: 'br', name: 'Brazil' },
  '56': { iso: 'cl', name: 'Chile' },
  '57': { iso: 'co', name: 'Colombia' },
  '58': { iso: 've', name: 'Venezuela' },
  '60': { iso: 'my', name: 'Malaysia' },
  '61': { iso: 'au', name: 'Australia' },
  '62': { iso: 'id', name: 'Indonesia' },
  '63': { iso: 'ph', name: 'Philippines' },
  '64': { iso: 'nz', name: 'New Zealand' },
  '65': { iso: 'sg', name: 'Singapore' },
  '66': { iso: 'th', name: 'Thailand' },
  '81': { iso: 'jp', name: 'Japan' },
  '82': { iso: 'kr', name: 'South Korea' },
  '84': { iso: 'vn', name: 'Vietnam' },
  '86': { iso: 'cn', name: 'China' },
  '90': { iso: 'tr', name: 'Turkey' },
  '91': { iso: 'in', name: 'India' },
  '92': { iso: 'pk', name: 'Pakistan' },
  '93': { iso: 'af', name: 'Afghanistan' },
  '94': { iso: 'lk', name: 'Sri Lanka' },
  '95': { iso: 'mm', name: 'Myanmar' },
  '98': { iso: 'ir', name: 'Iran' },
  '212': { iso: 'ma', name: 'Morocco' },
  '213': { iso: 'dz', name: 'Algeria' },
  '216': { iso: 'tn', name: 'Tunisia' },
  '218': { iso: 'ly', name: 'Libya' },
  '220': { iso: 'gm', name: 'Gambia' },
  '221': { iso: 'sn', name: 'Senegal' },
  '223': { iso: 'ml', name: 'Mali' },
  '224': { iso: 'gn', name: 'Guinea' },
  '225': { iso: 'ci', name: 'Ivory Coast' },
  '226': { iso: 'bf', name: 'Burkina Faso' },
  '227': { iso: 'ne', name: 'Niger' },
  '228': { iso: 'tg', name: 'Togo' },
  '229': { iso: 'bj', name: 'Benin' },
  '230': { iso: 'mu', name: 'Mauritius' },
  '231': { iso: 'lr', name: 'Liberia' },
  '232': { iso: 'sl', name: 'Sierra Leone' },
  '233': { iso: 'gh', name: 'Ghana' },
  '234': { iso: 'ng', name: 'Nigeria' },
  '237': { iso: 'cm', name: 'Cameroon' },
  '238': { iso: 'cv', name: 'Cape Verde' },
  '239': { iso: 'st', name: 'São Tomé' },
  '240': { iso: 'gq', name: 'Eq. Guinea' },
  '241': { iso: 'ga', name: 'Gabon' },
  '242': { iso: 'cg', name: 'Congo' },
  '243': { iso: 'cd', name: 'DR Congo' },
  '244': { iso: 'ao', name: 'Angola' },
  '245': { iso: 'gw', name: 'Guinea-Bissau' },
  '248': { iso: 'sc', name: 'Seychelles' },
  '249': { iso: 'sd', name: 'Sudan' },
  '250': { iso: 'rw', name: 'Rwanda' },
  '251': { iso: 'et', name: 'Ethiopia' },
  '252': { iso: 'so', name: 'Somalia' },
  '253': { iso: 'dj', name: 'Djibouti' },
  '254': { iso: 'ke', name: 'Kenya' },
  '255': { iso: 'tz', name: 'Tanzania' },
  '256': { iso: 'ug', name: 'Uganda' },
  '257': { iso: 'bi', name: 'Burundi' },
  '258': { iso: 'mz', name: 'Mozambique' },
  '260': { iso: 'zm', name: 'Zambia' },
  '261': { iso: 'mg', name: 'Madagascar' },
  '262': { iso: 're', name: 'Réunion' },
  '263': { iso: 'zw', name: 'Zimbabwe' },
  '264': { iso: 'na', name: 'Namibia' },
  '265': { iso: 'mw', name: 'Malawi' },
  '266': { iso: 'ls', name: 'Lesotho' },
  '267': { iso: 'bw', name: 'Botswana' },
  '268': { iso: 'sz', name: 'Eswatini' },
  '269': { iso: 'km', name: 'Comoros' },
  '351': { iso: 'pt', name: 'Portugal' },
  '352': { iso: 'lu', name: 'Luxembourg' },
  '353': { iso: 'ie', name: 'Ireland' },
  '354': { iso: 'is', name: 'Iceland' },
  '355': { iso: 'al', name: 'Albania' },
  '356': { iso: 'mt', name: 'Malta' },
  '357': { iso: 'cy', name: 'Cyprus' },
  '358': { iso: 'fi', name: 'Finland' },
  '359': { iso: 'bg', name: 'Bulgaria' },
  '370': { iso: 'lt', name: 'Lithuania' },
  '371': { iso: 'lv', name: 'Latvia' },
  '372': { iso: 'ee', name: 'Estonia' },
  '373': { iso: 'md', name: 'Moldova' },
  '374': { iso: 'am', name: 'Armenia' },
  '375': { iso: 'by', name: 'Belarus' },
  '376': { iso: 'ad', name: 'Andorra' },
  '377': { iso: 'mc', name: 'Monaco' },
  '378': { iso: 'sm', name: 'San Marino' },
  '380': { iso: 'ua', name: 'Ukraine' },
  '381': { iso: 'rs', name: 'Serbia' },
  '382': { iso: 'me', name: 'Montenegro' },
  '383': { iso: 'xk', name: 'Kosovo' },
  '385': { iso: 'hr', name: 'Croatia' },
  '386': { iso: 'si', name: 'Slovenia' },
  '387': { iso: 'ba', name: 'Bosnia' },
  '389': { iso: 'mk', name: 'N. Macedonia' },
  '420': { iso: 'cz', name: 'Czech Rep.' },
  '421': { iso: 'sk', name: 'Slovakia' },
  '423': { iso: 'li', name: 'Liechtenstein' },
  '852': { iso: 'hk', name: 'Hong Kong' },
  '853': { iso: 'mo', name: 'Macau' },
  '855': { iso: 'kh', name: 'Cambodia' },
  '856': { iso: 'la', name: 'Laos' },
  '880': { iso: 'bd', name: 'Bangladesh' },
  '886': { iso: 'tw', name: 'Taiwan' },
  '960': { iso: 'mv', name: 'Maldives' },
  '961': { iso: 'lb', name: 'Lebanon' },
  '962': { iso: 'jo', name: 'Jordan' },
  '963': { iso: 'sy', name: 'Syria' },
  '964': { iso: 'iq', name: 'Iraq' },
  '965': { iso: 'kw', name: 'Kuwait' },
  '966': { iso: 'sa', name: 'Saudi Arabia' },
  '967': { iso: 'ye', name: 'Yemen' },
  '968': { iso: 'om', name: 'Oman' },
  '970': { iso: 'ps', name: 'Palestine' },
  '971': { iso: 'ae', name: 'UAE' },
  '972': { iso: 'il', name: 'Israel' },
  '973': { iso: 'bh', name: 'Bahrain' },
  '974': { iso: 'qa', name: 'Qatar' },
  '975': { iso: 'bt', name: 'Bhutan' },
  '976': { iso: 'mn', name: 'Mongolia' },
  '977': { iso: 'np', name: 'Nepal' },
  '992': { iso: 'tj', name: 'Tajikistan' },
  '993': { iso: 'tm', name: 'Turkmenistan' },
  '994': { iso: 'az', name: 'Azerbaijan' },
  '995': { iso: 'ge', name: 'Georgia' },
  '996': { iso: 'kg', name: 'Kyrgyzstan' },
  '998': { iso: 'uz', name: 'Uzbekistan' },
};

// Get country from phone number
const getCountryFromPhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Try 3-digit prefix first, then 2-digit, then 1-digit
  for (const len of [3, 2, 1]) {
    const prefix = cleaned.substring(0, len);
    if (phoneToCountry[prefix]) {
      return phoneToCountry[prefix];
    }
  }
  return null;
};

// Country flag component
const CountryFlag = ({ iso, size = 32 }) => {
  if (!iso) return null;
  return (
    <img
      src={`https://flagsapi.com/${iso.toUpperCase()}/flat/64.png`}
      width={size}
      height={size * 0.67}
      alt={iso}
      className="inline-block rounded shadow-sm"
      style={{ objectFit: 'contain' }}
      loading="lazy"
    />
  );
};

export default function WhatsApp() {
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [connectionMethod, setConnectionMethod] = useState('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProxyCountry, setSelectedProxyCountry] = useState('');
  const [createSessionMessage, setCreateSessionMessage] = useState({ type: '', text: '' });

  // Dark theme colors
  const darkBg = 'bg-gray-900';
  const cardBg = 'bg-gray-800';
  const borderColor = 'border-gray-700';

  const { data: whatsappData, refetch: refetchWhatsappSessions } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
    refetchInterval: 3000,
  });

  const whatsappSessions = whatsappData?.sessions || [];
  const whatsappStats = whatsappData?.stats || null;

  const checkHealthMutation = useMutation({
    mutationFn: () => whatsapp.checkProxyHealth(),
    onSuccess: () => refetchWhatsappSessions(),
  });

  const createSessionMutation = useMutation({
    mutationFn: ({ name, usePhone, phone, proxyCountry }) => {
      if (usePhone) {
        return whatsapp.createSessionWithPhone(name, phone, proxyCountry || null);
      }
      return whatsapp.createSession(name, proxyCountry || null);
    },
    onSuccess: (response) => {
      refetchWhatsappSessions();
      setShowCreateSessionModal(false);
      setNewSessionName('');
      setPhoneNumber('');
      setSelectedProxyCountry('');
      setConnectionMethod('qr');
      const method = response.data?.connectionMethod === 'pairing_code' ? 'pairing code' : 'QR code';
      setCreateSessionMessage({ type: 'success', text: `Session created! Waiting for ${method}.` });
      setTimeout(() => setCreateSessionMessage({ type: '', text: '' }), 5000);
    },
    onError: (error) => {
      setCreateSessionMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create session' });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (sessionId) => whatsapp.disconnectSession(sessionId),
    onSuccess: () => refetchWhatsappSessions(),
  });

  const connectMutation = useMutation({
    mutationFn: (sessionId) => whatsapp.connectSession(sessionId),
    onSuccess: () => {
      refetchWhatsappSessions();
      setCreateSessionMessage({ type: 'success', text: 'Reconnecting session...' });
      setTimeout(() => setCreateSessionMessage({ type: '', text: '' }), 3000);
    },
    onError: (error) => {
      setCreateSessionMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reconnect' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId) => whatsapp.deleteSession(sessionId),
    onSuccess: () => refetchWhatsappSessions(),
  });

  const updateNameMutation = useMutation({
    mutationFn: ({ sessionId, newName }) => whatsapp.updateSessionName(sessionId, newName),
    onSuccess: () => {
      refetchWhatsappSessions();
      setCreateSessionMessage({ type: 'success', text: 'Session name updated!' });
      setTimeout(() => setCreateSessionMessage({ type: '', text: '' }), 2000);
    },
    onError: (error) => {
      setCreateSessionMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update name' });
    },
  });

  const handleEditName = (session) => {
    const newName = prompt(`Edit session name:`, session.name);
    if (newName && newName.trim() && newName !== session.name) {
      updateNameMutation.mutate({ sessionId: session.sessionId, newName: newName.trim() });
    }
  };

  const clearAllMutation = useMutation({
    mutationFn: () => whatsapp.clearAllHistory(),
    onSuccess: () => {
      refetchWhatsappSessions();
      setCreateSessionMessage({ type: 'success', text: 'All history cleared successfully!' });
      setTimeout(() => setCreateSessionMessage({ type: '', text: '' }), 3000);
    },
    onError: (error) => {
      setCreateSessionMessage({ type: 'error', text: error.response?.data?.error || 'Failed to clear history' });
    },
  });

  const handleClearAll = () => {
    // Direct action without confirmation popup
    clearAllMutation.mutate();
  };

  const handleDeleteSession = (session) => {
    // Direct action without confirmation popup
    deleteMutation.mutate(session.sessionId);
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const sessionName = newSessionName.trim() || `WhatsApp Session ${Date.now()}`;

    if (connectionMethod === 'phone' && !phoneNumber.trim()) {
      setCreateSessionMessage({ type: 'error', text: 'Phone number is required' });
      return;
    }

    createSessionMutation.mutate({
      name: sessionName,
      usePhone: connectionMethod === 'phone',
      phone: phoneNumber.trim(),
      proxyCountry: selectedProxyCountry
    });
  };

  const getProxyStatusColor = (status) => {
    if (status === 'healthy') return 'bg-green-500';
    if (status === 'dead') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getProxyStatusBg = (status, activeSessions) => {
    if (status === 'dead') return 'bg-red-100 border-red-300 text-red-800';
    if (activeSessions > 0) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">WhatsApp Accounts</h1>
            <p className="text-gray-400">Manage your WhatsApp connections</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
              <p className="text-sm text-gray-400">Manage multiple WhatsApp connections</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateSessionModal(true)}
            disabled={whatsappStats?.available <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            Add Account
          </button>
        </div>

        {whatsappStats && (
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
                <div className="text-2xl font-bold text-gray-500">{whatsappStats.disconnected}</div>
                <div className="text-xs text-gray-400 uppercase">Disconnected</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${whatsappStats.available <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                  {whatsappStats.available}/{whatsappStats.maxAllowed}
                </div>
                <div className="text-xs text-gray-400 uppercase">Available</div>
              </div>
            </div>

            {whatsappStats.proxy && (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    🌐 Proxy Servers
                    <span className="text-xs text-gray-500">
                      ({whatsappStats.proxy.healthyCount} healthy, {whatsappStats.proxy.deadCount} dead)
                    </span>
                  </h4>
                  <button
                    onClick={() => checkHealthMutation.mutate()}
                    disabled={checkHealthMutation.isPending}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${checkHealthMutation.isPending ? 'animate-spin' : ''}`} />
                    Check Health
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {whatsappStats.proxy.servers?.map((server, idx) => (
                    <div key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${server.status === 'dead' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                      server.activeSessions > 0 ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                        'bg-gray-700 border-gray-600 text-gray-400'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${getProxyStatusColor(server.status)}`}></div>
                      <span>{server.flag}</span>
                      <span>{server.country}</span>
                      <span className="opacity-70">({server.activeSessions}/{whatsappStats.proxy.maxSessionsPerProxy})</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Healthy</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Dead</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Unknown</span>
                </div>
              </div>
            )}

            {/* Clear All Button */}
            <div className="pt-4 border-t border-gray-700 mt-4">
              <button
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className={`w-4 h-4 ${clearAllMutation.isPending ? 'animate-pulse' : ''}`} />
                {clearAllMutation.isPending ? 'Clearing...' : 'Clear All History'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Delete all sessions, chats, and messages permanently</p>
            </div>
          </div>
        )}

        {createSessionMessage.text && (
          <div className={`m-6 mb-0 flex items-center gap-3 p-4 rounded-lg ${createSessionMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            {createSessionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <p className={`text-sm font-medium ${createSessionMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{createSessionMessage.text}</p>
          </div>
        )}

        <div className="p-6 space-y-4">
          {whatsappSessions.length > 0 ? (
            whatsappSessions.map((session) => (
              <div key={session.sessionId} className="bg-gray-700/50 rounded-lg border border-gray-600 p-5 hover:border-green-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {/* Country flag based on phone number */}
                    {session.phoneNumber && getCountryFromPhone(session.phoneNumber) && (
                      <div className="flex-shrink-0">
                        <CountryFlag iso={getCountryFromPhone(session.phoneNumber).iso} size={40} />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.status === 'connected' ? 'bg-green-500/20' : session.status === 'connecting' ? 'bg-yellow-500/20' : 'bg-gray-600'}`}>
                      <Phone className={`w-6 h-6 ${session.status === 'connected' ? 'text-green-400' : session.status === 'connecting' ? 'text-yellow-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{session.name}</h3>
                      {session.phoneNumber && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          +{session.phoneNumber}
                          {getCountryFromPhone(session.phoneNumber) && (
                            <span className="text-xs text-gray-500">({getCountryFromPhone(session.phoneNumber).name})</span>
                          )}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className={`w-2 h-2 rounded-full ${session.status === 'connected' ? 'bg-green-500 animate-pulse' : session.status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className={`text-xs font-medium ${session.status === 'connected' ? 'text-green-400' : session.status === 'connecting' ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {session.status === 'connected' ? 'Connected' : session.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
                        </span>
                        {session.proxy && (
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${session.proxy.status === 'healthy' ? 'bg-green-500/20 text-green-400' : session.proxy.status === 'dead' ? 'bg-red-500/20 text-red-400' : 'bg-gray-600 text-gray-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${getProxyStatusColor(session.proxy.status)}`}></div>
                            {session.proxy.flag} {session.proxy.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditName(session)}
                      disabled={updateNameMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 font-medium disabled:opacity-50"
                      title="Edit name"
                    >
                      Edit
                    </button>
                    {session.status === 'disconnected' && (
                      <button
                        onClick={() => connectMutation.mutate(session.sessionId)}
                        disabled={connectMutation.isPending}
                        className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        {connectMutation.isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Reconnecter
                      </button>
                    )}
                    {session.status === 'connected' && (
                      <button onClick={() => disconnectMutation.mutate(session.sessionId)} disabled={disconnectMutation.isPending} className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium disabled:opacity-50">Disconnect</button>
                    )}
                    <button onClick={() => handleDeleteSession(session)} disabled={deleteMutation.isPending} className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                </div>

                {session.status === 'connecting' && session.hasQR && session.qrCode && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Scan QR Code</span>
                      </div>
                      {session.proxy && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${session.proxy.status === 'healthy' ? 'bg-green-500' : session.proxy.status === 'dead' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                          <Globe className="w-3 h-3" />
                          {session.proxy.flag} {session.proxy.name}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      {session.proxy && (
                        <div className={`w-full mb-4 p-3 rounded-lg border ${session.proxy.status === 'healthy' ? 'bg-green-500/20 border-green-500/30' : session.proxy.status === 'dead' ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl">{session.proxy.flag}</span>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${session.proxy.status === 'healthy' ? 'text-green-400' : session.proxy.status === 'dead' ? 'text-red-400' : 'text-blue-400'}`}>{session.proxy.name}</div>
                              <div className={`text-xs ${session.proxy.status === 'healthy' ? 'text-green-500' : session.proxy.status === 'dead' ? 'text-red-500' : 'text-blue-500'}`}>{session.proxy.host}</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${getProxyStatusColor(session.proxy.status)}`}></div>
                          </div>
                        </div>
                      )}
                      <img src={session.qrCode} alt="QR Code" className="w-48 h-48 rounded-lg" />
                      <p className="text-xs text-gray-400 mt-3 text-center">WhatsApp → Linked Devices → Link a Device → Scan</p>
                    </div>
                  </div>
                )}

                {session.status === 'connecting' && session.hasPairingCode && session.pairingCode && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">Enter Pairing Code</span>
                      </div>
                      {session.proxy && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${session.proxy.status === 'healthy' ? 'bg-green-500' : session.proxy.status === 'dead' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                          <Globe className="w-3 h-3" />
                          {session.proxy.flag} {session.proxy.name}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-lg border border-blue-500/30">
                      {session.proxy && (
                        <div className={`w-full mb-4 p-3 rounded-lg border ${session.proxy.status === 'healthy' ? 'bg-green-500/20 border-green-500/30' : session.proxy.status === 'dead' ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl">{session.proxy.flag}</span>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${session.proxy.status === 'healthy' ? 'text-green-400' : session.proxy.status === 'dead' ? 'text-red-400' : 'text-blue-400'}`}>{session.proxy.name}</div>
                              <div className={`text-xs ${session.proxy.status === 'healthy' ? 'text-green-500' : session.proxy.status === 'dead' ? 'text-red-500' : 'text-blue-500'}`}>{session.proxy.host}</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${getProxyStatusColor(session.proxy.status)}`}></div>
                          </div>
                        </div>
                      )}
                      <div className="text-4xl font-mono font-bold text-blue-400 tracking-widest bg-gray-800 px-6 py-3 rounded-lg shadow-lg border-2 border-blue-500/50">{session.pairingCode}</div>
                      <p className="text-xs text-blue-400 mt-3 text-center">WhatsApp → Linked Devices → Link with phone number</p>
                    </div>
                  </div>
                )}

                {session.status === 'connecting' && !session.hasQR && !session.hasPairingCode && session.proxy && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex flex-col items-center p-6 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm text-gray-400 mb-3">Connecting via proxy...</p>
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${session.proxy.status === 'healthy' ? 'bg-green-500/20' : session.proxy.status === 'dead' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                        <span className="text-2xl">{session.proxy.flag}</span>
                        <div>
                          <div className={`text-sm font-bold ${session.proxy.status === 'healthy' ? 'text-green-400' : session.proxy.status === 'dead' ? 'text-red-400' : 'text-blue-400'}`}>{session.proxy.name}</div>
                          <div className={`text-xs ${session.proxy.status === 'healthy' ? 'text-green-500' : session.proxy.status === 'dead' ? 'text-red-500' : 'text-blue-500'}`}>{session.proxy.host}</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getProxyStatusColor(session.proxy.status)}`}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No WhatsApp Accounts</h3>
              <p className="text-gray-400 mb-4">Connect your WhatsApp account</p>
              <button onClick={() => setShowCreateSessionModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg shadow-green-500/20">
                <UserPlus className="w-5 h-5" />
                Add WhatsApp Account
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Add WhatsApp Account</h3>
              </div>
              <button onClick={() => { setShowCreateSessionModal(false); setNewSessionName(''); setPhoneNumber(''); setSelectedProxyCountry(''); setConnectionMethod('qr'); setCreateSessionMessage({ type: '', text: '' }); }} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-5">
              {createSessionMessage.text && createSessionMessage.type === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm font-medium text-red-400">{createSessionMessage.text}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Connection Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setConnectionMethod('qr')} className={`p-4 rounded-xl border-2 transition-all ${connectionMethod === 'qr' ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500/30' : 'border-gray-600 bg-gray-700 hover:border-green-500/50'}`}>
                    <QrCode className={`w-8 h-8 mx-auto mb-2 ${connectionMethod === 'qr' ? 'text-green-400' : 'text-gray-400'}`} />
                    <div className={`text-sm font-medium ${connectionMethod === 'qr' ? 'text-green-400' : 'text-gray-300'}`}>QR Code</div>
                    <p className="text-xs text-gray-500 mt-1">Existing account</p>
                  </button>
                  <button type="button" onClick={() => setConnectionMethod('phone')} className={`p-4 rounded-xl border-2 transition-all ${connectionMethod === 'phone' ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/30' : 'border-gray-600 bg-gray-700 hover:border-blue-500/50'}`}>
                    <Smartphone className={`w-8 h-8 mx-auto mb-2 ${connectionMethod === 'phone' ? 'text-blue-400' : 'text-gray-400'}`} />
                    <div className={`text-sm font-medium ${connectionMethod === 'phone' ? 'text-blue-400' : 'text-gray-300'}`}>Phone Number</div>
                    <p className="text-xs text-gray-500 mt-1">New account</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Select Proxy Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProxyCountry('US')}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedProxyCountry === 'US'
                      ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-blue-500/50'
                      }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl mb-1">🇺🇸</p>
                      <p className={`text-sm font-medium ${selectedProxyCountry === 'US' ? 'text-blue-400' : 'text-gray-300'}`}>USA</p>
                      <p className="text-xs text-gray-500">5 proxies</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProxyCountry('NL')}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedProxyCountry === 'NL'
                      ? 'border-orange-500 bg-orange-500/20 ring-2 ring-orange-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-orange-500/50'
                      }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl mb-1">🇳🇱</p>
                      <p className={`text-sm font-medium ${selectedProxyCountry === 'NL' ? 'text-orange-400' : 'text-gray-300'}`}>Netherlands</p>
                      <p className="text-xs text-gray-500">4 proxies</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProxyCountry('SE')}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedProxyCountry === 'SE'
                      ? 'border-yellow-500 bg-yellow-500/20 ring-2 ring-yellow-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-yellow-500/50'
                      }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl mb-1">🇸🇪</p>
                      <p className={`text-sm font-medium ${selectedProxyCountry === 'SE' ? 'text-yellow-400' : 'text-gray-300'}`}>Sweden</p>
                      <p className="text-xs text-gray-500">4 proxies</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProxyCountry('')}
                    className={`p-4 rounded-xl border-2 transition-all ${!selectedProxyCountry || selectedProxyCountry === ''
                      ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-green-500/50'
                      }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl mb-1">⚡</p>
                      <p className={`text-sm font-medium ${!selectedProxyCountry ? 'text-green-400' : 'text-gray-300'}`}>Auto</p>
                      <p className="text-xs text-gray-500">Recommended</p>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedProxyCountry && selectedProxyCountry !== ''
                    ? `✓ Manual proxy selected: ${selectedProxyCountry}`
                    : '⚡ Auto mode will select the best proxy based on your number'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Name <span className="text-gray-500">(Optional)</span></label>
                <input type="text" value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none text-white placeholder-gray-500" placeholder="Auto-detect from WhatsApp..." />
              </div>

              {connectionMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-white placeholder-gray-500" placeholder="+1234567890" required={connectionMethod === 'phone'} />
                  <p className="text-xs text-yellow-400 mt-1">⚠️ Experimental: May not work with all numbers</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateSessionModal(false); setNewSessionName(''); setPhoneNumber(''); setSelectedProxyCountry(''); setConnectionMethod('qr'); }} className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700" disabled={createSessionMutation.isPending}>Cancel</button>
                <button type="submit" disabled={createSessionMutation.isPending} className={`flex-1 px-4 py-3 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${connectionMethod === 'qr' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                  {createSessionMutation.isPending ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</> : <>{connectionMethod === 'qr' ? <><QrCode className="w-4 h-4" />Generate QR</> : <><Hash className="w-4 h-4" />Get Code</>}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
