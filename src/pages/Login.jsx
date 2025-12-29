import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, EyeOff } from 'lucide-react';
import { auth } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const response = await auth.login(email, password);
      console.log('✅ Login successful:', response.data);

      // Remember email if requested
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store token and agent info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('agent', JSON.stringify(response.data.agent));

      console.log('✅ Token stored, redirecting to dashboard...');

      // Force reload to avoid cache issues
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || err.message || 'Login failed');
      setLoading(false);
    }
  };

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full filter blur-[100px]"></div>

      {/* Glassmorphism Card */}
      <div className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:border-violet-500/30">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-violet-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>

        <div className="text-center mb-8">
          {/* Animated Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-2xl opacity-80"></div>
            <div className="absolute inset-[2px] bg-gray-900 rounded-2xl"></div>
            <MessageSquare className="relative w-10 h-10 text-violet-400 transform group-hover:scale-110 group-hover:text-emerald-400 transition-all duration-300" />
          </div>

          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-emerald-200">WhatsApp Platform</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">Global Multi-Country Messaging</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="group">
            <label className="block text-sm font-bold text-white/90 mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 outline-none hover:border-gray-600"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-white/90 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-5 py-3.5 pr-12 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 outline-none hover:border-gray-600"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border border-gray-600 bg-gray-800 text-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-400 font-medium cursor-pointer select-none hover:text-white transition-colors">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Button Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-emerald-600 transition-all duration-300 group-hover:from-violet-500 group-hover:to-emerald-500"></div>

            {/* Animated Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
            </div>

            {/* Button Shadow */}
            <div className="absolute inset-0 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:shadow-violet-500/50 transition-all duration-300"></div>

            <span className="relative flex items-center justify-center gap-2 text-lg tracking-wide">
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-emerald-400 font-medium transition-colors">
              Create one here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
