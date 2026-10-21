import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Users
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickSwitchRole } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('farmer@krishiseva.in');
  const [password, setPassword] = useState('kisan@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = login(email, password);
    if (res.success && res.user) {
      showToast('Logged In Successfully', `Welcome back, ${res.user.fullName}!`, 'success');
      // Redirect based on role
      switch (res.user.role) {
        case 'Farmer':
          navigate('/farmer');
          break;
        case 'CHC':
          navigate('/chc-dashboard');
          break;
        case 'FMC':
          navigate('/fmc-dashboard');
          break;
        case 'LivestockShop':
          navigate('/livestock-shop');
          break;
        case 'Inputstore':
          navigate('/input-store');
          break;
        case 'Facilitator':
          navigate('/facilitator');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        case 'superadmin':
          navigate('/superadmin');
          break;
        default:
          navigate('/farmer');
      }
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = (role: UserRole | 'pending_chc' | 'rejected_fmc' | 'suspended') => {
    quickSwitchRole(role);
    showToast('Role Switched', `Logged in via quick test adapter.`, 'info');
    if (role === 'pending_chc' || role === 'rejected_fmc') {
      navigate('/application-status');
    } else if (role === 'suspended') {
      setErrorMsg('This account is suspended by administrative policy.');
    } else {
      switch (role) {
        case 'Farmer': navigate('/farmer'); break;
        case 'CHC': navigate('/chc-dashboard'); break;
        case 'FMC': navigate('/fmc-dashboard'); break;
        case 'LivestockShop': navigate('/livestock-shop'); break;
        case 'Inputstore': navigate('/input-store'); break;
        case 'Facilitator': navigate('/facilitator'); break;
        case 'Admin': navigate('/admin'); break;
        case 'superadmin': navigate('/superadmin'); break;
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-elevation border border-brand-border overflow-hidden">
        {/* Left Side: Brand & Quick Demo Switcher */}
        <div className="lg:col-span-5 bg-forest-900 text-white p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-harvest font-bold">
                KS
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight">KrishiSeva</span>
            </div>
            <h2 className="font-heading font-bold text-lg mt-6 text-white">
              AgriTech Ecosystem Sign In
            </h2>
            <p className="text-xs text-forest-200 mt-2 leading-relaxed">
              Access role-specific workflows for farmers, hiring centres, livestock suppliers, facilitators, and administrative personnel.
            </p>
          </div>

          {/* Quick Evaluator Access */}
          <div className="bg-forest-800/80 p-4 rounded-2xl border border-forest-700 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-harvest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Test Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('Farmer')}
                className="p-2 rounded-lg bg-forest-900/60 hover:bg-forest-900 text-left border border-forest-700 font-medium text-cream-100"
              >
                🌾 Farmer (Rameshwar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('CHC')}
                className="p-2 rounded-lg bg-forest-900/60 hover:bg-forest-900 text-left border border-forest-700 font-medium text-cream-100"
              >
                🚜 CHC Centre
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Facilitator')}
                className="p-2 rounded-lg bg-forest-900/60 hover:bg-forest-900 text-left border border-forest-700 font-medium text-cream-100"
              >
                📋 Facilitator (Pooja)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="p-2 rounded-lg bg-forest-900/60 hover:bg-forest-900 text-left border border-forest-700 font-medium text-cream-100"
              >
                🛡️ Admin Console
              </button>
            </div>
          </div>

          <div className="text-[11px] text-forest-300">
            Helpline: <strong>1800-180-1551</strong> (Kisan Call Centre)
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-forest-900">
              Welcome Back
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Please enter your registered credentials to access your dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-brand-error/30 text-rose-900 text-xs flex items-start gap-2.5 animate-slide-down">
              <ShieldAlert className="w-4 h-4 text-brand-error shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Authentication Notice:</span>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                {errorMsg.includes('PENDING') || errorMsg.includes('UNDER REVIEW') || errorMsg.includes('Corrections') ? (
                  <Link to="/application-status" className="font-bold text-forest-700 underline block pt-1">
                    Check Application Status & Timeline →
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Email Address or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@krishiseva.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Demo Password Reset: Use any test password for mock verification accounts.")}
                  className="text-[11px] text-forest-700 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-brand-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-600 accent-forest-600"
                />
                <span>Remember this workstation</span>
              </label>

              <Link to="/application-status" className="font-semibold text-forest-700 hover:underline">
                Check Registration Status
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-brand-border pt-4 text-center text-xs text-brand-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-800 hover:underline">
              Register as Farmer or Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
