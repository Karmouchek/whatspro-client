import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Building, Phone, Globe, Clock, Languages } from 'lucide-react';
import { auth } from '../services/api';

// Country list with ISO codes, timezones and dial codes
const countries = [
  { code: 'US', name: 'United States', timezone: 'America/New_York', flag: 'us', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London', flag: 'gb', dial: '+44' },
  { code: 'FR', name: 'France', timezone: 'Europe/Paris', flag: 'fr', dial: '+33' },
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin', flag: 'de', dial: '+49' },
  { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid', flag: 'es', dial: '+34' },
  { code: 'IT', name: 'Italy', timezone: 'Europe/Rome', flag: 'it', dial: '+39' },
  { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam', flag: 'nl', dial: '+31' },
  { code: 'BE', name: 'Belgium', timezone: 'Europe/Brussels', flag: 'be', dial: '+32' },
  { code: 'CH', name: 'Switzerland', timezone: 'Europe/Zurich', flag: 'ch', dial: '+41' },
  { code: 'AT', name: 'Austria', timezone: 'Europe/Vienna', flag: 'at', dial: '+43' },
  { code: 'PT', name: 'Portugal', timezone: 'Europe/Lisbon', flag: 'pt', dial: '+351' },
  { code: 'PL', name: 'Poland', timezone: 'Europe/Warsaw', flag: 'pl', dial: '+48' },
  { code: 'SE', name: 'Sweden', timezone: 'Europe/Stockholm', flag: 'se', dial: '+46' },
  { code: 'NO', name: 'Norway', timezone: 'Europe/Oslo', flag: 'no', dial: '+47' },
  { code: 'DK', name: 'Denmark', timezone: 'Europe/Copenhagen', flag: 'dk', dial: '+45' },
  { code: 'FI', name: 'Finland', timezone: 'Europe/Helsinki', flag: 'fi', dial: '+358' },
  { code: 'IE', name: 'Ireland', timezone: 'Europe/Dublin', flag: 'ie', dial: '+353' },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto', flag: 'ca', dial: '+1' },
  { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney', flag: 'au', dial: '+61' },
  { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland', flag: 'nz', dial: '+64' },
  { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo', flag: 'br', dial: '+55' },
  { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City', flag: 'mx', dial: '+52' },
  { code: 'AR', name: 'Argentina', timezone: 'America/Buenos_Aires', flag: 'ar', dial: '+54' },
  { code: 'CL', name: 'Chile', timezone: 'America/Santiago', flag: 'cl', dial: '+56' },
  { code: 'CO', name: 'Colombia', timezone: 'America/Bogota', flag: 'co', dial: '+57' },
  { code: 'PE', name: 'Peru', timezone: 'America/Lima', flag: 'pe', dial: '+51' },
  { code: 'VE', name: 'Venezuela', timezone: 'America/Caracas', flag: 've', dial: '+58' },
  { code: 'EC', name: 'Ecuador', timezone: 'America/Guayaquil', flag: 'ec', dial: '+593' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo', flag: 'jp', dial: '+81' },
  { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul', flag: 'kr', dial: '+82' },
  { code: 'CN', name: 'China', timezone: 'Asia/Shanghai', flag: 'cn', dial: '+86' },
  { code: 'HK', name: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: 'hk', dial: '+852' },
  { code: 'TW', name: 'Taiwan', timezone: 'Asia/Taipei', flag: 'tw', dial: '+886' },
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata', flag: 'in', dial: '+91' },
  { code: 'PK', name: 'Pakistan', timezone: 'Asia/Karachi', flag: 'pk', dial: '+92' },
  { code: 'BD', name: 'Bangladesh', timezone: 'Asia/Dhaka', flag: 'bd', dial: '+880' },
  { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore', flag: 'sg', dial: '+65' },
  { code: 'AE', name: 'UAE', timezone: 'Asia/Dubai', flag: 'ae', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: 'sa', dial: '+966' },
  { code: 'QA', name: 'Qatar', timezone: 'Asia/Qatar', flag: 'qa', dial: '+974' },
  { code: 'KW', name: 'Kuwait', timezone: 'Asia/Kuwait', flag: 'kw', dial: '+965' },
  { code: 'BH', name: 'Bahrain', timezone: 'Asia/Bahrain', flag: 'bh', dial: '+973' },
  { code: 'OM', name: 'Oman', timezone: 'Asia/Muscat', flag: 'om', dial: '+968' },
  { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem', flag: 'il', dial: '+972' },
  { code: 'LB', name: 'Lebanon', timezone: 'Asia/Beirut', flag: 'lb', dial: '+961' },
  { code: 'JO', name: 'Jordan', timezone: 'Asia/Amman', flag: 'jo', dial: '+962' },
  { code: 'TR', name: 'Turkey', timezone: 'Europe/Istanbul', flag: 'tr', dial: '+90' },
  { code: 'RU', name: 'Russia', timezone: 'Europe/Moscow', flag: 'ru', dial: '+7' },
  { code: 'UA', name: 'Ukraine', timezone: 'Europe/Kiev', flag: 'ua', dial: '+380' },
  { code: 'CZ', name: 'Czech Republic', timezone: 'Europe/Prague', flag: 'cz', dial: '+420' },
  { code: 'HU', name: 'Hungary', timezone: 'Europe/Budapest', flag: 'hu', dial: '+36' },
  { code: 'RO', name: 'Romania', timezone: 'Europe/Bucharest', flag: 'ro', dial: '+40' },
  { code: 'BG', name: 'Bulgaria', timezone: 'Europe/Sofia', flag: 'bg', dial: '+359' },
  { code: 'GR', name: 'Greece', timezone: 'Europe/Athens', flag: 'gr', dial: '+30' },
  { code: 'HR', name: 'Croatia', timezone: 'Europe/Zagreb', flag: 'hr', dial: '+385' },
  { code: 'RS', name: 'Serbia', timezone: 'Europe/Belgrade', flag: 'rs', dial: '+381' },
  { code: 'SK', name: 'Slovakia', timezone: 'Europe/Bratislava', flag: 'sk', dial: '+421' },
  { code: 'SI', name: 'Slovenia', timezone: 'Europe/Ljubljana', flag: 'si', dial: '+386' },
  { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg', flag: 'za', dial: '+27' },
  { code: 'EG', name: 'Egypt', timezone: 'Africa/Cairo', flag: 'eg', dial: '+20' },
  { code: 'MA', name: 'Morocco', timezone: 'Africa/Casablanca', flag: 'ma', dial: '+212' },
  { code: 'DZ', name: 'Algeria', timezone: 'Africa/Algiers', flag: 'dz', dial: '+213' },
  { code: 'TN', name: 'Tunisia', timezone: 'Africa/Tunis', flag: 'tn', dial: '+216' },
  { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos', flag: 'ng', dial: '+234' },
  { code: 'GH', name: 'Ghana', timezone: 'Africa/Accra', flag: 'gh', dial: '+233' },
  { code: 'KE', name: 'Kenya', timezone: 'Africa/Nairobi', flag: 'ke', dial: '+254' },
  { code: 'TZ', name: 'Tanzania', timezone: 'Africa/Dar_es_Salaam', flag: 'tz', dial: '+255' },
  { code: 'UG', name: 'Uganda', timezone: 'Africa/Kampala', flag: 'ug', dial: '+256' },
  { code: 'ET', name: 'Ethiopia', timezone: 'Africa/Addis_Ababa', flag: 'et', dial: '+251' },
  { code: 'SN', name: 'Senegal', timezone: 'Africa/Dakar', flag: 'sn', dial: '+221' },
  { code: 'CI', name: 'Ivory Coast', timezone: 'Africa/Abidjan', flag: 'ci', dial: '+225' },
  { code: 'CM', name: 'Cameroon', timezone: 'Africa/Douala', flag: 'cm', dial: '+237' },
  { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok', flag: 'th', dial: '+66' },
  { code: 'VN', name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: 'vn', dial: '+84' },
  { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta', flag: 'id', dial: '+62' },
  { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', flag: 'my', dial: '+60' },
  { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila', flag: 'ph', dial: '+63' },
  { code: 'MM', name: 'Myanmar', timezone: 'Asia/Yangon', flag: 'mm', dial: '+95' },
  { code: 'KH', name: 'Cambodia', timezone: 'Asia/Phnom_Penh', flag: 'kh', dial: '+855' },
  { code: 'LA', name: 'Laos', timezone: 'Asia/Vientiane', flag: 'la', dial: '+856' },
  { code: 'NP', name: 'Nepal', timezone: 'Asia/Kathmandu', flag: 'np', dial: '+977' },
  { code: 'LK', name: 'Sri Lanka', timezone: 'Asia/Colombo', flag: 'lk', dial: '+94' },
  { code: 'AF', name: 'Afghanistan', timezone: 'Asia/Kabul', flag: 'af', dial: '+93' },
  { code: 'IQ', name: 'Iraq', timezone: 'Asia/Baghdad', flag: 'iq', dial: '+964' },
  { code: 'IR', name: 'Iran', timezone: 'Asia/Tehran', flag: 'ir', dial: '+98' },
  { code: 'SY', name: 'Syria', timezone: 'Asia/Damascus', flag: 'sy', dial: '+963' },
  { code: 'YE', name: 'Yemen', timezone: 'Asia/Aden', flag: 'ye', dial: '+967' },
  { code: 'AZ', name: 'Azerbaijan', timezone: 'Asia/Baku', flag: 'az', dial: '+994' },
  { code: 'GE', name: 'Georgia', timezone: 'Asia/Tbilisi', flag: 'ge', dial: '+995' },
  { code: 'AM', name: 'Armenia', timezone: 'Asia/Yerevan', flag: 'am', dial: '+374' },
  { code: 'KZ', name: 'Kazakhstan', timezone: 'Asia/Almaty', flag: 'kz', dial: '+7' },
  { code: 'UZ', name: 'Uzbekistan', timezone: 'Asia/Tashkent', flag: 'uz', dial: '+998' },
  { code: 'CY', name: 'Cyprus', timezone: 'Asia/Nicosia', flag: 'cy', dial: '+357' },
  { code: 'MT', name: 'Malta', timezone: 'Europe/Malta', flag: 'mt', dial: '+356' },
  { code: 'LU', name: 'Luxembourg', timezone: 'Europe/Luxembourg', flag: 'lu', dial: '+352' },
  { code: 'IS', name: 'Iceland', timezone: 'Atlantic/Reykjavik', flag: 'is', dial: '+354' },
  { code: 'EE', name: 'Estonia', timezone: 'Europe/Tallinn', flag: 'ee', dial: '+372' },
  { code: 'LV', name: 'Latvia', timezone: 'Europe/Riga', flag: 'lv', dial: '+371' },
  { code: 'LT', name: 'Lithuania', timezone: 'Europe/Vilnius', flag: 'lt', dial: '+370' },
  { code: 'BY', name: 'Belarus', timezone: 'Europe/Minsk', flag: 'by', dial: '+375' },
  { code: 'MD', name: 'Moldova', timezone: 'Europe/Chisinau', flag: 'md', dial: '+373' },
  { code: 'AL', name: 'Albania', timezone: 'Europe/Tirane', flag: 'al', dial: '+355' },
  { code: 'MK', name: 'North Macedonia', timezone: 'Europe/Skopje', flag: 'mk', dial: '+389' },
  { code: 'BA', name: 'Bosnia', timezone: 'Europe/Sarajevo', flag: 'ba', dial: '+387' },
  { code: 'ME', name: 'Montenegro', timezone: 'Europe/Podgorica', flag: 'me', dial: '+382' },
  { code: 'XK', name: 'Kosovo', timezone: 'Europe/Belgrade', flag: 'xk', dial: '+383' },
  { code: 'CU', name: 'Cuba', timezone: 'America/Havana', flag: 'cu', dial: '+53' },
  { code: 'DO', name: 'Dominican Republic', timezone: 'America/Santo_Domingo', flag: 'do', dial: '+1' },
  { code: 'PR', name: 'Puerto Rico', timezone: 'America/Puerto_Rico', flag: 'pr', dial: '+1' },
  { code: 'JM', name: 'Jamaica', timezone: 'America/Jamaica', flag: 'jm', dial: '+1' },
  { code: 'TT', name: 'Trinidad and Tobago', timezone: 'America/Port_of_Spain', flag: 'tt', dial: '+1' },
  { code: 'PA', name: 'Panama', timezone: 'America/Panama', flag: 'pa', dial: '+507' },
  { code: 'CR', name: 'Costa Rica', timezone: 'America/Costa_Rica', flag: 'cr', dial: '+506' },
  { code: 'GT', name: 'Guatemala', timezone: 'America/Guatemala', flag: 'gt', dial: '+502' },
  { code: 'HN', name: 'Honduras', timezone: 'America/Tegucigalpa', flag: 'hn', dial: '+504' },
  { code: 'SV', name: 'El Salvador', timezone: 'America/El_Salvador', flag: 'sv', dial: '+503' },
  { code: 'NI', name: 'Nicaragua', timezone: 'America/Managua', flag: 'ni', dial: '+505' },
  { code: 'PY', name: 'Paraguay', timezone: 'America/Asuncion', flag: 'py', dial: '+595' },
  { code: 'UY', name: 'Uruguay', timezone: 'America/Montevideo', flag: 'uy', dial: '+598' },
  { code: 'BO', name: 'Bolivia', timezone: 'America/La_Paz', flag: 'bo', dial: '+591' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
];

// Flag component
const CountryFlag = ({ iso, size = 24 }) => (
  <img
    src={`https://flagsapi.com/${iso.toUpperCase()}/flat/64.png`}
    width={size}
    height={size * 0.67}
    alt={iso}
    className="inline-block rounded shadow-sm"
    style={{ objectFit: 'contain' }}
  />
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phoneCode: '+1',
    phone: '',
    country: 'US',
    timezone: 'America/New_York',
    preferredLanguage: 'en',
    selectedLanguages: ['en'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);

  // Get selected phone country
  const selectedPhoneCountry = countries.find(c => c.dial === formData.phoneCode) || countries[0];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-update timezone when country changes
    if (field === 'country') {
      const country = countries.find(c => c.code === value);
      if (country) {
        setFormData(prev => ({ ...prev, country: value, timezone: country.timezone }));
      }
    }
  };

  const toggleLanguage = (langCode) => {
    setFormData(prev => {
      const selected = prev.selectedLanguages.includes(langCode)
        ? prev.selectedLanguages.filter(l => l !== langCode)
        : [...prev.selectedLanguages, langCode];
      return { ...prev, selectedLanguages: selected.length > 0 ? selected : ['en'] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await auth.register(
        formData.name,
        formData.email,
        formData.password,
        formData.company,
        formData.phone,
        formData.country,
        formData.timezone,
        formData.preferredLanguage,
        formData.selectedLanguages.join(',')
      );
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Dark Premium Background */}
        <div className="absolute inset-0 bg-[#0a0a0f]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-transparent to-violet-950/30"></div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/15 rounded-full filter blur-[120px]"></div>

        <div className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-gray-400 mb-4">
            Your account has been created with all features enabled:
          </p>
          <ul className="text-left text-gray-500 text-sm mb-6 space-y-2">
            <li>✅ 5 WhatsApp sessions</li>
            <li>✅ AI Chatbot enabled</li>
            <li>✅ Auto-reply enabled</li>
            <li>✅ Working hours: 09:00 - 18:00</li>
            <li>✅ Notifications enabled</li>
            <li>✅ Virtual numbers access</li>
          </ul>
          <p className="text-gray-500 text-sm mb-6">
            Your account is pending approval by an administrator.
          </p>

          <Link
            to="/login"
            className="inline-block w-full py-4 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-violet-500 transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const selectedCountry = countries.find(c => c.code === formData.country);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Dark Premium Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-transparent to-emerald-950/30"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Subtle Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full filter blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full filter blur-[120px]"></div>

      <div className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-violet-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>

        <div className="relative text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-2xl opacity-80"></div>
            <div className="absolute inset-[2px] bg-gray-900 rounded-2xl"></div>
            <UserPlus className="relative w-8 h-8 text-violet-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Step {step} of 2 - {step === 1 ? 'Basic Info' : 'Preferences'}</p>
        </div>

        {/* Progress bar */}
        <div className="relative flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-violet-500' : 'bg-gray-700'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                      placeholder="••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Building className="w-4 h-4 inline mr-1" />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  {/* Custom dropdown with flags */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                      className="flex items-center gap-2 w-28 px-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all text-sm"
                    >
                      <CountryFlag iso={selectedPhoneCountry.flag} size={20} />
                      <span>{selectedPhoneCountry.dial}</span>
                      <svg className={`w-4 h-4 ml-auto transition-transform ${phoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {phoneDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
                        {countries.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              updateField('phoneCode', c.dial);
                              setPhoneDropdownOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors text-sm ${formData.phoneCode === c.dial ? 'bg-violet-600/20 text-violet-300' : 'text-white'
                              }`}
                          >
                            <CountryFlag iso={c.flag} size={20} />
                            <span className="flex-1">{c.name}</span>
                            <span className="text-gray-400">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none hover:border-gray-600 transition-all"
                    placeholder="612345678"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter your number without the country code</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.company || !formData.phone) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-emerald-600 text-white rounded-xl font-bold hover:from-violet-500 hover:to-emerald-500 transition-all"
              >
                Next Step →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Country
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none appearance-none hover:border-gray-600 transition-all"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="bg-gray-800 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {selectedCountry && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <CountryFlag iso={selectedCountry.flag} size={24} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-detected from country</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Languages className="w-4 h-4 inline mr-1" />
                  Preferred Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => updateField('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none appearance-none hover:border-gray-600 transition-all"
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code} className="bg-gray-800 text-white">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Languages You Speak (for AI chatbot)
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.slice(0, 12).map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => toggleLanguage(l.code)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.selectedLanguages.includes(l.code)
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                        }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Features Included:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>✅ 5 WhatsApp sessions</div>
                  <div>✅ AI Chatbot</div>
                  <div>✅ Auto-reply</div>
                  <div>✅ Virtual numbers</div>
                  <div>✅ Proxy protection</div>
                  <div>✅ Analytics</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-600 text-gray-300 rounded-xl font-bold hover:bg-gray-800 hover:text-white transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-emerald-600 text-white rounded-xl font-bold hover:from-violet-500 hover:to-emerald-500 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-emerald-400 font-medium transition-colors">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
