import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { Button } from '../components/ui/Button';
import { useData } from '../hooks/useData';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine post-login redirect path
  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your institutional email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = authenticate(cleanEmail, cleanPassword);
      setLoading(false);

      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.error || 'Invalid institutional credentials. Please check your email and password.');
      }
    }, 250);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-brand-canvas select-none">
      <div className="w-full max-w-md bg-white border border-brand-border rounded shadow-elevated overflow-hidden">
        {/* Top Header */}
        <div className="p-8 text-center border-b border-brand-border bg-white">
          <div className="flex justify-center mb-5">
            <BrandLogo variant="full" size="lg" withTagline={true} />
          </div>
          <h1 className="text-xl font-bold text-brand-graphite-900 tracking-tight">
            Institutional Access Portal
          </h1>
          <p className="mt-1.5 text-xs text-brand-graphite-500 max-w-sm mx-auto leading-relaxed">
            Sign in to access facility safety plans, mock evacuation drills, and building management.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-normal">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-graphite-700 mb-1.5 font-mono">
              Institutional Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-graphite-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none bg-white text-brand-graphite-900 placeholder-brand-graphite-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-graphite-700 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-graphite-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2 text-sm border border-brand-border rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none bg-white text-brand-graphite-900 placeholder-brand-graphite-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-graphite-400 hover:text-brand-graphite-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold shadow-xs"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Operations
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-brand-graphite-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Institutional Authentication</span>
          </div>
        </form>

        {/* Public Access Link */}
        <div className="p-4 bg-brand-graphite-50 border-t border-brand-border text-center text-[11px] text-brand-graphite-500 flex items-center justify-between">
          <span>Looking for public building guides?</span>
          <Link
            to="/building/academic-block"
            className="text-brand-red font-semibold hover:underline inline-flex items-center gap-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Public QR Plan</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
