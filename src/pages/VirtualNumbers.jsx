import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { numbers } from '../services/api';
import { Phone, CreditCard, Globe, ShoppingCart, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, Ban, ChevronDown, Search, Copy, Zap } from 'lucide-react';

// Country code to ISO mapping for flag images
const countryToISO = {
  // 5SIM & SMSPVA text codes
  'russia': 'ru', 'ukraine': 'ua', 'kazakhstan': 'kz', 'usa': 'us', 'england': 'gb',
  'germany': 'de', 'france': 'fr', 'spain': 'es', 'italy': 'it', 'netherlands': 'nl',
  'poland': 'pl', 'brazil': 'br', 'india': 'in', 'indonesia': 'id', 'philippines': 'ph',
  'vietnam': 'vn', 'thailand': 'th', 'malaysia': 'my', 'mexico': 'mx', 'canada': 'ca',
  'australia': 'au', 'sweden': 'se', 'finland': 'fi', 'norway': 'no', 'denmark': 'dk',
  'portugal': 'pt', 'belgium': 'be', 'austria': 'at', 'switzerland': 'ch', 'czech': 'cz',
  'romania': 'ro', 'hungary': 'hu', 'bulgaria': 'bg', 'serbia': 'rs', 'croatia': 'hr',
  'greece': 'gr', 'turkey': 'tr', 'egypt': 'eg', 'morocco': 'ma', 'southafrica': 'za',
  'nigeria': 'ng', 'kenya': 'ke', 'argentina': 'ar', 'chile': 'cl', 'colombia': 'co',
  'peru': 'pe', 'venezuela': 've', 'china': 'cn', 'japan': 'jp', 'southkorea': 'kr',
  'taiwan': 'tw', 'hongkong': 'hk', 'singapore': 'sg', 'newzealand': 'nz', 'ireland': 'ie',
  'israel': 'il', 'uae': 'ae', 'saudiarabia': 'sa', 'pakistan': 'pk', 'bangladesh': 'bd',
  'cambodia': 'kh', 'nepal': 'np', 'srilanka': 'lk', 'laos': 'la', 'myanmar': 'mm',
  'mongolia': 'mn', 'georgia': 'ge', 'armenia': 'am', 'azerbaijan': 'az', 'belarus': 'by',
  'moldova': 'md', 'latvia': 'lv', 'lithuania': 'lt', 'estonia': 'ee', 'slovenia': 'si',
  'slovakia': 'sk', 'cyprus': 'cy', 'malta': 'mt', 'luxembourg': 'lu', 'iceland': 'is',
  'ecuador': 'ec', 'bolivia': 'bo', 'paraguay': 'py', 'uruguay': 'uy', 'costarica': 'cr',
  'panama': 'pa', 'guatemala': 'gt', 'honduras': 'hn', 'salvador': 'sv', 'nicaragua': 'ni',
  'dominicana': 'do', 'jamaica': 'jm', 'haiti': 'ht', 'cuba': 'cu', 'puertorico': 'pr',
  'ghana': 'gh', 'cameroon': 'cm', 'senegal': 'sn', 'ivorycoast': 'ci', 'tanzania': 'tz',
  'uganda': 'ug', 'ethiopia': 'et', 'mozambique': 'mz', 'zambia': 'zm', 'zimbabwe': 'zw',
  'botswana': 'bw', 'namibia': 'na', 'tunisia': 'tn', 'algeria': 'dz', 'libya': 'ly',
  'jordan': 'jo', 'lebanon': 'lb', 'iraq': 'iq', 'iran': 'ir', 'kuwait': 'kw',
  'qatar': 'qa', 'bahrain': 'bh', 'oman': 'om', 'yemen': 'ye', 'afghanistan': 'af',
  'uzbekistan': 'uz', 'tajikistan': 'tj', 'kyrgyzstan': 'kg', 'turkmenistan': 'tm',
  // GrizzlySMS numeric codes
  '0': 'ru', '1': 'ua', '2': 'kz', '3': 'cn', '4': 'ph', '5': 'mm', '6': 'id', '7': 'my',
  '8': 'ke', '9': 'tz', '10': 'vn', '11': 'kg', '12': 'us', '13': 'il', '14': 'hk', '15': 'pl',
  '16': 'gb', '17': 'mg', '18': 'cg', '19': 'ng', '20': 'mo', '21': 'eg', '22': 'in', '23': 'ie',
  '24': 'kh', '25': 'la', '26': 'ht', '27': 'ci', '28': 'gm', '29': 'rs', '30': 'ye', '31': 'za',
  '32': 'ro', '33': 'co', '34': 'ee', '35': 'az', '36': 'ca', '37': 'ma', '38': 'gh', '39': 'ar',
  '40': 'uz', '41': 'cm', '42': 'td', '43': 'de', '44': 'lt', '45': 'hr', '46': 'se', '47': 'iq',
  '48': 'nl', '49': 'lv', '50': 'at', '51': 'by', '52': 'th', '53': 'sa', '54': 'mx', '55': 'tw',
  '56': 'es', '57': 'ir', '58': 'dz', '59': 'si', '60': 'bd', '61': 'sn', '62': 'tr', '63': 'cz',
  '64': 'lk', '65': 'pe', '66': 'pk', '67': 'nz', '68': 'gn', '69': 'ml', '70': 've', '71': 'et',
  '72': 'mn', '73': 'br', '74': 'af', '75': 'ug', '76': 'ao', '77': 'cy', '78': 'fr', '79': 'pg',
  '80': 'mz', '81': 'np', '82': 'be', '83': 'bg', '84': 'hu', '85': 'md', '86': 'it', '87': 'py',
  '88': 'hn', '89': 'tn', '90': 'ni', '91': 'tl', '92': 'bo', '93': 'cr', '94': 'gt', '95': 'ae',
  '96': 'zw', '97': 'pr', '98': 'sd', '99': 'tg', '100': 'kw', '101': 'sv', '102': 'lr', '103': 'jm',
  '104': 'tt', '105': 'ec', '106': 'sz', '107': 'gw', '108': 'gy', '109': 'mr', '110': 'rw',
  '111': 'na', '112': 'sl', '113': 'tj', '114': 'ls', '115': 'sr', '116': 'bj', '117': 'mw',
  '118': 'zm', '119': 'bi', '120': 'bw', '121': 'bz', '122': 'dm', '123': 'gd', '124': 'lc',
  '125': 'vc', '126': 'ag', '127': 'bb', '128': 'bs', '129': 'bm', '130': 'ky', '131': 'tc',
  '132': 'vg', '133': 'vi', '134': 'ai', '135': 'ms', '136': 'sx', '137': 'cw', '138': 'aw',
  '139': 'bq', '140': 'mq', '141': 'gp', '142': 'gf', '143': 're', '144': 'yt', '145': 'nc',
  '146': 'pf', '147': 'wf', '148': 'pm', '149': 'gl', '150': 'fo', '151': 'gi', '152': 'im',
  '153': 'je', '154': 'gg', '155': 'ax', '156': 'sj', '157': 'sj', '158': 'bv', '159': 'gs',
  '160': 'hm', '161': 'cx', '162': 'cc', '163': 'nf', '164': 'nu', '165': 'tk', '166': 'ck',
  '167': 'pn', '168': 'ws', '169': 'as', '170': 'to', '171': 'fj', '172': 'vu', '173': 'sb',
  '174': 'ki', '175': 'tv', '176': 'nr', '177': 'pw', '178': 'mh', '179': 'fm', '180': 'gu',
  '181': 'mp', '182': 'mv', '183': 'sc', '184': 'mu', '185': 'km', '186': 'cv', '187': 'st',
  '188': 'gq', '189': 'ga', '190': 'cf', '191': 'ss', '192': 'er', '193': 'dj', '194': 'so',
  '195': 'eh', '196': 'ly', '197': 'mr', '198': 'ne', '199': 'bf', '200': 'td', '201': 'tm',
  '202': 'bt', '203': 'bn', '204': 'tl', '205': 'kp', '206': 'kr', '207': 'jp', '208': 'au',
  '209': 'nz', '210': 'aq',
  // Virtual regions
  '1000': 'un', '1001': 'eu', '1002': 'un', '1003': 'un', '1004': 'un', '1005': 'un',
  '1006': 'un', '1007': 'un', '1008': 'un', '1062': 'un', '10161': 'gb', '10227': 'in', '10231': 'za',
  // ISO codes (already correct)
  'US': 'us', 'UK': 'gb', 'CA': 'ca', 'AU': 'au', 'DE': 'de', 'FR': 'fr', 'ES': 'es', 'IT': 'it',
  'NL': 'nl', 'PL': 'pl', 'PT': 'pt', 'SE': 'se', 'NO': 'no', 'DK': 'dk', 'FI': 'fi', 'BE': 'be',
  'AT': 'at', 'CH': 'ch', 'IE': 'ie', 'RU': 'ru', 'UA': 'ua', 'KZ': 'kz', 'BY': 'by', 'IN': 'in',
  'ID': 'id', 'PH': 'ph', 'VN': 'vn', 'TH': 'th', 'MY': 'my', 'SG': 'sg', 'HK': 'hk', 'CN': 'cn',
  'JP': 'jp', 'KR': 'kr', 'TW': 'tw', 'BR': 'br', 'MX': 'mx', 'AR': 'ar', 'CL': 'cl', 'CO': 'co',
  'PE': 'pe', 'ZA': 'za', 'NG': 'ng', 'KE': 'ke', 'EG': 'eg', 'MA': 'ma', 'TR': 'tr', 'IL': 'il',
  'AE': 'ae', 'SA': 'sa', 'PK': 'pk', 'BD': 'bd', 'NP': 'np', 'LK': 'lk', 'MM': 'mm', 'KH': 'kh',
  'LA': 'la', 'CZ': 'cz', 'RO': 'ro', 'HU': 'hu', 'BG': 'bg', 'GR': 'gr', 'HR': 'hr', 'RS': 'rs',
  'SK': 'sk', 'SI': 'si', 'EE': 'ee', 'LV': 'lv', 'LT': 'lt', 'GE': 'ge', 'AM': 'am', 'AZ': 'az',
  'MD': 'md', 'NZ': 'nz'
};

// Flag component using multiple CDN sources for reliability
const CountryFlag = ({ countryCode, countryIso, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  // Priority: use ISO if provided, otherwise try to convert countryCode
  let iso = countryIso || countryToISO[countryCode?.toLowerCase()] || countryToISO[countryCode] || countryCode;

  // If still not found, try to use the code as-is if it's 2 letters
  if (!iso || iso === countryCode) {
    if (typeof countryCode === 'string' && countryCode.length === 2) {
      iso = countryCode.toLowerCase();
    } else {
      // Default to world emoji instead of flag API
      return <span className={`inline-block ${className}`} style={{ fontSize: size === 'sm' ? '16px' : size === 'md' ? '22px' : size === 'lg' ? '32px' : '43px' }}>🌍</span>;
    }
  }

  // List of ISO codes that don't work with the flag API (return 500 errors)
  // These are territories, dependencies, or special regions without standard flags
  const unsupportedCodes = [
    'un', 'eu', 'sx', 'bv', 'bq', 'hm', 'gs', 'sj', 'ax', 'yt', 'mq', 'gp', 'gf', 're', 'pm',
    'wf', 'nc', 'pf', 'tk', 'nu', 'ck', 'pn', 'as', 'gu', 'mp', 'vi', 'pr', 'um', 'vg', 'ai',
    'ms', 'tc', 'ky', 'bm', 'fk', 'sh', 'io', 'tf', 'aq', 'cx', 'cc', 'nf', 'cw', 'aw', 'bl',
    'mf', 'sj', 'bv', 'hm', 'gs'
  ];

  if (unsupportedCodes.includes(iso.toLowerCase())) {
    return <span className={`inline-block ${className}`} style={{ fontSize: size === 'sm' ? '16px' : size === 'md' ? '22px' : size === 'lg' ? '32px' : '43px' }}>🌍</span>;
  }

  const sizes = {
    sm: { width: 24, height: 16 },
    md: { width: 32, height: 22 },
    lg: { width: 48, height: 32 },
    xl: { width: 64, height: 43 }
  };
  const { width, height } = sizes[size] || sizes.md;

  // If already had an error, show emoji
  if (hasError) {
    return <span className={`inline-block ${className}`} style={{ fontSize: size === 'sm' ? '16px' : size === 'md' ? '22px' : size === 'lg' ? '32px' : '43px' }}>🌍</span>;
  }

  // Using countryflagsapi.com which is very reliable
  const flagUrl = `https://flagsapi.com/${iso.toUpperCase()}/flat/64.png`;

  return (
    <img
      src={flagUrl}
      width={width}
      height={height}
      alt={countryCode}
      className={`inline-block rounded shadow-sm ${className}`}
      style={{ objectFit: 'contain', minWidth: width }}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export default function VirtualNumbers() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('5sim');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedProxyForOrder, setSelectedProxyForOrder] = useState({}); // orderId -> proxyCountry
  const dropdownRef = useRef(null);

  // Copy to clipboard function
  const copyToClipboard = async (text, orderId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['numbers-balance'],
    queryFn: () => numbers.getBalance().then(res => res.data),
    refetchInterval: 60000,
  });

  const { data: countriesData, isLoading: loadingCountries } = useQuery({
    queryKey: ['numbers-countries'],
    queryFn: () => numbers.getCountries().then(res => res.data),
    refetchInterval: 180000, // Refresh every 3 minutes
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['numbers-orders'],
    queryFn: () => numbers.getActiveOrders().then(res => res.data),
    refetchInterval: 5000,
  });

  const orders = ordersData?.orders || [];

  // Auto-check SMS for pending orders every 10 seconds
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Filter valid orders with ID
    const pendingOrders = orders.filter(o => o.id && !o.smsCode && (o.status === 'PENDING' || o.status === 'WAITING'));
    if (pendingOrders.length === 0) return;

    const intervalId = setInterval(() => {
      console.log(`[Auto SMS Check] Checking ${pendingOrders.length} pending orders...`);
      pendingOrders.forEach(order => {
        if (!order.id || !order.provider) {
          console.error('[Auto SMS Check] Invalid order:', order);
          return;
        }
        numbers.checkSms(order.provider, order.id)
          .then(() => {
            console.log(`[Auto SMS Check] Checked order #${order.id}`);
            refetchOrders();
          })
          .catch(err => {
            console.error(`[Auto SMS Check] Error checking order #${order.id}:`, err);
          });
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [orders.length]); // Only re-create interval when number of orders changes

  const buyMutation = useMutation({
    mutationFn: ({ country, provider, operator }) => numbers.buyNumber(country, provider, operator),
    onSuccess: (res) => {
      refetchBalance();
      refetchOrders();

      if (res.data.order.whatsappSessionCreated) {
        setMessage({
          type: 'success',
          text: `✅ Number ${res.data.order.phoneFormatted} purchased! WhatsApp session created. Redirecting...`
        });

        // Redirect to WhatsApp page after 2 seconds
        setTimeout(() => {
          window.location.href = '/whatsapp';
        }, 2000);
      } else {
        setMessage({
          type: 'success',
          text: `Number purchased: ${res.data.order.phoneFormatted}`
        });
      }
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to buy number' });
    }
  });

  const countries = countriesData?.countries || [];

  const checkSmsMutation = useMutation({
    mutationKey: ['check-sms'],
    mutationFn: ({ provider, orderId }) => {
      console.log('[Check SMS] Checking:', { provider, orderId });
      return numbers.checkSms(provider, orderId);
    },
    onSuccess: (data) => {
      console.log('[Check SMS] Success:', data);
      refetchOrders();
    },
    onError: (error) => {
      console.error('[Check SMS] Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to check SMS' });
    }
  });

  const finishMutation = useMutation({
    mutationKey: ['finish-order'],
    mutationFn: ({ provider, orderId }) => {
      console.log('[Finish] Finishing order:', { provider, orderId });
      return numbers.finishOrder(provider, orderId);
    },
    onSuccess: () => {
      console.log('[Finish] Success');
      refetchOrders();
      setMessage({ type: 'success', text: 'Order completed' });
    },
    onError: (error) => {
      console.error('[Finish] Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to finish order' });
    }
  });

  const cancelMutation = useMutation({
    mutationKey: ['cancel-order'],
    mutationFn: ({ provider, orderId }) => {
      console.log('[Cancel] Cancelling order:', { provider, orderId });
      return numbers.cancelOrder(provider, orderId);
    },
    onSuccess: () => {
      console.log('[Cancel] Success');
      refetchOrders();
      refetchBalance();
      setMessage({ type: 'success', text: 'Order cancelled, refund issued' });
    },
    onError: (error) => {
      console.error('[Cancel] Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to cancel order' });
    }
  });

  const banMutation = useMutation({
    mutationKey: ['ban-number'],
    mutationFn: ({ provider, orderId }) => {
      console.log('[Ban] Reporting number:', { provider, orderId });
      return numbers.banNumber(provider, orderId);
    },
    onSuccess: () => {
      console.log('[Ban] Success');
      refetchOrders();
      setMessage({ type: 'success', text: 'Number reported as banned' });
    },
    onError: (error) => {
      console.error('[Ban] Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to report number' });
    }
  });

  const balances = balanceData?.balances || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECEIVED': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'CANCELED': return 'bg-red-500/20 text-red-400';
      case 'TIMEOUT': return 'bg-gray-600 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Virtual Numbers</h1>
          <p className="text-gray-400">Buy phone numbers for WhatsApp verification</p>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-gray-500 hover:text-gray-300">×</button>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((balance) => {
          const providerColors = {
            '5sim': 'bg-gradient-to-r from-blue-500 to-cyan-600',
            'smspva': 'bg-gradient-to-r from-purple-500 to-pink-600',
            'grizzlysms': 'bg-gradient-to-r from-orange-500 to-red-600'
          };
          const providerNames = {
            '5sim': '5SIM',
            'smspva': 'SMSPVA',
            'grizzlysms': 'GrizzlySMS'
          };

          return (
            <div key={balance.provider} className={`rounded-xl shadow-lg p-6 text-white ${providerColors[balance.provider] || 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-10 h-10" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      {providerNames[balance.provider] || balance.provider} Balance
                    </p>
                    {balance.error ? (
                      <p className="text-sm text-white/70">{balance.error}</p>
                    ) : (
                      <p className="text-3xl font-bold">
                        {balance.balance?.toFixed(2) || '0.00'} {balance.currency === 'RUB' ? '₽' : balance.currency === 'USD' ? '$' : balance.currency}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => refetchBalance()}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Orders */}
      {orders.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Active Orders ({orders.length})
          </h2>

          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-gray-700/50 rounded-lg border border-gray-600 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CountryFlag countryCode={order.country} countryIso={order.iso} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg text-white">{order.phoneFormatted}</p>
                        <button
                          onClick={() => copyToClipboard(order.phoneFormatted, order.id)}
                          className={`p-1.5 rounded-lg transition-all ${copiedId === order.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-600 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400'
                            }`}
                          title="Copy number"
                        >
                          {copiedId === order.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {copiedId === order.id && (
                          <span className="text-xs text-green-400 font-medium">Copied!</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        Order #{order.id} • {order.country} •
                        <span className={`ml-1 font-medium ${order.provider === '5sim' ? 'text-blue-400' :
                          order.provider === 'smspva' ? 'text-purple-400' :
                            'text-orange-400'
                          }`}>
                          {order.provider === '5sim' ? '5SIM' :
                            order.provider === 'smspva' ? 'SMSPVA' :
                              'GrizzlySMS'}
                        </span>
                      </p>
                      {order.proxySelectionReason && (
                        <p className="text-xs text-blue-400 font-medium mt-1">
                          {order.proxySelectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {order.smsCode && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-green-400">SMS Code:</span>
                      <span className="font-mono font-bold text-xl text-green-300">{order.smsCode}</span>
                      <button
                        onClick={() => copyToClipboard(order.smsCode, `sms-${order.id}`)}
                        className={`p-1.5 rounded-lg transition-all ${copiedId === `sms-${order.id}`
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          }`}
                        title="Copy SMS code"
                      >
                        {copiedId === `sms-${order.id}` ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {copiedId === `sms-${order.id}` && (
                        <span className="text-xs text-green-400 font-medium">Copied!</span>
                      )}
                    </div>
                    {order.smsText && (
                      <p className="text-xs text-green-500 mt-1">{order.smsText}</p>
                    )}
                  </div>
                )}

                {!order.smsCode && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">
                        Waiting for SMS... Auto-checking every 10 seconds
                      </span>
                    </div>
                    {order.minutesUntilAvailable > 0 && (
                      <div className="mt-2 flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-lg p-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">
                          ⏰ Number will be available in {order.minutesUntilAvailable} minute{order.minutesUntilAvailable > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {order.smsCode && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Select Proxy for WhatsApp:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedProxyForOrder({ ...selectedProxyForOrder, [order.id]: 'US' })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedProxyForOrder[order.id] === 'US'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
                          }`}
                      >
                        🇺🇸 USA (5 proxies)
                      </button>
                      <button
                        onClick={() => setSelectedProxyForOrder({ ...selectedProxyForOrder, [order.id]: 'NL' })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedProxyForOrder[order.id] === 'NL'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-700 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
                          }`}
                      >
                        🇳🇱 Netherlands (4 proxies)
                      </button>
                      <button
                        onClick={() => setSelectedProxyForOrder({ ...selectedProxyForOrder, [order.id]: 'SE' })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedProxyForOrder[order.id] === 'SE'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
                          }`}
                      >
                        🇸🇪 Sweden (4 proxies)
                      </button>
                      <button
                        onClick={() => setSelectedProxyForOrder({ ...selectedProxyForOrder, [order.id]: 'AUTO' })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!selectedProxyForOrder[order.id] || selectedProxyForOrder[order.id] === 'AUTO'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                          }`}
                      >
                        ⚡ Auto (Recommended)
                      </button>
                    </div>
                    {selectedProxyForOrder[order.id] && selectedProxyForOrder[order.id] !== 'AUTO' && (
                      <p className="text-xs text-blue-400 mt-2">
                        ✓ Manual proxy selected: {selectedProxyForOrder[order.id]}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {!order.smsCode && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[Button Click] Check SMS button clicked for:', { provider: order.provider, orderId: order.id });
                        checkSmsMutation.mutate({ provider: order.provider, orderId: order.id });
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Check SMS
                    </button>
                  )}

                  {order.smsCode && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[Button Click] Create WhatsApp Session clicked');

                          // Get selected proxy or use auto
                          const selectedProxy = selectedProxyForOrder[order.id];
                          let proxyCountry = null;

                          if (selectedProxy && selectedProxy !== 'AUTO') {
                            proxyCountry = selectedProxy;
                          } else {
                            // Auto mode: use recommended region
                            proxyCountry = order.recommendedProxyRegion === 'americas' ? 'US' : 'NL';
                          }

                          console.log(`Creating session with proxy: ${proxyCountry} (selected: ${selectedProxy || 'AUTO'})`);

                          // Create WhatsApp session with selected proxy
                          numbers.createWhatsAppSession(order.id, order.provider, order.phoneFormatted, proxyCountry)
                            .then((res) => {
                              setMessage({ type: 'success', text: `WhatsApp session created with ${res.data.proxyCountry} proxy!` });
                              // Redirect to WhatsApp sessions page after 2 seconds
                              setTimeout(() => window.location.href = '/whatsapp', 2000);
                            })
                            .catch((err) => {
                              setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create session' });
                            });
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        Create WhatsApp
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[Button Click] Complete button clicked for:', { provider: order.provider, orderId: order.id });
                          finishMutation.mutate({ provider: order.provider, orderId: order.id });
                        }}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('[Button Click] Cancel button clicked for:', { provider: order.provider, orderId: order.id });
                      cancelMutation.mutate({ provider: order.provider, orderId: order.id });
                    }}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('[Button Click] Report Ban button clicked for:', { provider: order.provider, orderId: order.id });
                      banMutation.mutate({ provider: order.provider, orderId: order.id });
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    Report Ban
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy Number */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-400" />
          Buy WhatsApp Number
        </h2>

        {loadingCountries ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading countries...</span>
          </div>
        ) : (
          <>
            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Zap className="w-4 h-4 inline mr-1" />
                Provider
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider('5sim');
                    setSelectedCountry(''); // Reset country when changing provider
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedProvider === '5sim'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700 hover:border-blue-500/50'
                    }`}
                >
                  <div className="text-center">
                    <p className="font-bold text-lg text-blue-400">5SIM</p>
                    <p className="text-xs text-gray-400">
                      {countries.filter(c => c.provider === '5sim').length} countries
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider('smspva');
                    setSelectedCountry(''); // Reset country when changing provider
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedProvider === 'smspva'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 bg-gray-700 hover:border-purple-500/50'
                    }`}
                >
                  <div className="text-center">
                    <p className="font-bold text-lg text-purple-400">SMSPVA</p>
                    <p className="text-xs text-gray-400">
                      {countries.filter(c => c.provider === 'smspva').length} countries
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider('grizzlysms');
                    setSelectedCountry(''); // Reset country when changing provider
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedProvider === 'grizzlysms'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 bg-gray-700 hover:border-orange-500/50'
                    }`}
                >
                  <div className="text-center">
                    <p className="font-bold text-lg text-orange-400">GrizzlySMS</p>
                    <p className="text-xs text-gray-400">
                      {countries.filter(c => c.provider === 'grizzlysms').length} countries
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Select Country
              </label>

              {/* Custom dropdown with flags */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 flex items-center justify-between text-left"
                >
                  {selectedCountry ? (
                    <div className="flex items-center gap-3">
                      <CountryFlag
                        countryCode={selectedCountry}
                        countryIso={countries.find(c => c.code === selectedCountry && c.provider === selectedProvider)?.iso}
                        size="md"
                      />
                      <span className="text-white">
                        {countries.find(c => c.code === selectedCountry && c.provider === selectedProvider)?.name || 'Unknown'}
                      </span>
                      <span className={`font-medium ${selectedProvider === '5sim' ? 'text-blue-400' :
                        selectedProvider === 'smspva' ? 'text-purple-400' :
                          'text-orange-400'
                        }`}>
                        {countries.find(c => c.code === selectedCountry && c.provider === selectedProvider)?.price.toFixed(2)} {selectedProvider === '5sim' ? '₽' : '$'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Choose a country...</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Country list */}
                    <div className="overflow-y-auto max-h-60">
                      {countries
                        .filter(c => c.provider === selectedProvider)
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(country => (
                          <button
                            key={`${country.provider}-${country.code}`}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country.code);
                              setDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-700 transition-colors ${selectedCountry === country.code ? 'bg-blue-900/40 border-l-2 border-blue-500' : ''
                              }`}
                          >
                            <CountryFlag countryCode={country.code} countryIso={country.iso} size="md" />
                            <span className="flex-1 text-left text-white">{country.name}</span>
                            <span className={`font-medium ${country.provider === '5sim' ? 'text-blue-400' :
                              country.provider === 'smspva' ? 'text-purple-400' :
                                'text-orange-400'
                              }`}>
                              {country.price.toFixed(2)} {country.provider === '5sim' ? '₽' : '$'}
                            </span>
                            <span className="text-xs text-gray-400">{country.available}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const country = countries.find(c => c.code === selectedCountry && c.provider === selectedProvider);
                buyMutation.mutate({
                  country: selectedCountry,
                  provider: selectedProvider,
                  operator: country?.operator || 'any'
                });
              }}
              disabled={!selectedCountry || buyMutation.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {buyMutation.isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Purchasing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Buy Number
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Available Countries by Provider */}
      <div className="space-y-6">
        {/* 5SIM Countries */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">5SIM Countries</h2>
              <p className="text-xs text-gray-500">{countries.filter(c => c.provider === '5sim').length} countries available</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {countries.filter(c => c.provider === '5sim').slice(0, 12).map(country => (
              <button
                key={`${country.provider}-${country.code}`}
                onClick={() => {
                  setSelectedProvider('5sim');
                  setSelectedCountry(country.code);
                  buyMutation.mutate({
                    country: country.code,
                    provider: '5sim',
                    operator: country.operator || 'any'
                  });
                }}
                disabled={buyMutation.isPending || country.available === 0}
                className={`p-3 rounded-lg border transition-all text-left ${country.available === 0
                  ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                  : 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 disabled:opacity-50'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CountryFlag countryCode={country.code} countryIso={country.iso} size="md" />
                  <span className={`font-medium text-sm truncate flex-1 ${country.available === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                    {country.name}
                  </span>
                  {country.available === 0 && (
                    <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-0.5 rounded">Out of Stock</span>
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-bold ${country.available === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                    {country.available === 0 ? 'N/A' : `${country.price.toFixed(2)} ₽`}
                  </span>
                  <span className={country.available === 0 ? 'text-red-400 font-medium' : 'text-gray-400'}>
                    {country.available} avail.
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SMSPVA Countries */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">SMSPVA Countries</h2>
              <p className="text-xs text-gray-500">{countries.filter(c => c.provider === 'smspva').length} countries available</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {countries.filter(c => c.provider === 'smspva').slice(0, 12).map(country => (
              <button
                key={`${country.provider}-${country.code}`}
                onClick={() => {
                  setSelectedProvider('smspva');
                  setSelectedCountry(country.code);
                  buyMutation.mutate({
                    country: country.code,
                    provider: 'smspva',
                    operator: country.operator || 'any'
                  });
                }}
                disabled={buyMutation.isPending || country.available === 0}
                className={`p-3 rounded-lg border transition-all text-left ${country.available === 0
                  ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                  : 'bg-gray-700 border-gray-600 hover:border-purple-500 hover:bg-purple-900/20 disabled:opacity-50'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CountryFlag countryCode={country.code} countryIso={country.iso} size="md" />
                  <span className={`font-medium text-sm truncate flex-1 ${country.available === 0 ? 'text-gray-400' : 'text-white'}`}>
                    {country.name}
                  </span>
                  {country.available === 0 && (
                    <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-0.5 rounded">Out of Stock</span>
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-bold ${country.available === 0 ? 'text-gray-400' : 'text-purple-600'}`}>
                    {country.available === 0 ? 'N/A' : `${country.price.toFixed(2)} $`}
                  </span>
                  <span className={country.available === 0 ? 'text-red-400 font-medium' : 'text-gray-400'}>
                    {country.available} avail.
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* GrizzlySMS Countries */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">GrizzlySMS Countries</h2>
              <p className="text-xs text-gray-500">{countries.filter(c => c.provider === 'grizzlysms').length} countries available</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {countries.filter(c => c.provider === 'grizzlysms').slice(0, 12).map(country => (
              <button
                key={`${country.provider}-${country.code}`}
                onClick={() => {
                  setSelectedProvider('grizzlysms');
                  setSelectedCountry(country.code);
                  buyMutation.mutate({
                    country: country.code,
                    provider: 'grizzlysms',
                    operator: country.operator || 'any'
                  });
                }}
                disabled={buyMutation.isPending || country.available === 0}
                className={`p-3 rounded-lg border transition-all text-left ${country.available === 0
                  ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                  : 'bg-gray-700 border-gray-600 hover:border-orange-500 hover:bg-orange-900/20 disabled:opacity-50'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CountryFlag countryCode={country.code} countryIso={country.iso} size="md" />
                  <span className={`font-medium text-sm truncate flex-1 ${country.available === 0 ? 'text-gray-400' : 'text-white'}`}>
                    {country.name}
                  </span>
                  {country.available === 0 && (
                    <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-0.5 rounded">Out of Stock</span>
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-bold ${country.available === 0 ? 'text-gray-400' : 'text-orange-600'}`}>
                    {country.available === 0 ? 'N/A' : `${country.price.toFixed(2)} $`}
                  </span>
                  <span className={country.available === 0 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                    {country.available} avail.
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
