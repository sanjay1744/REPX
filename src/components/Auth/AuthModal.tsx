import React, { useState } from 'react';
import { X, LogIn, Mail, Phone, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    error,
    clearError,
    isLoading
  } = useAuthStore();

  const [authMethod, setAuthMethod] = useState<'google' | 'email' | 'phone'>('email');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  // Email & Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;

    if (emailMode === 'signup') {
      if (password !== confirmPassword) {
        useAuthStore.setState({ error: 'Passwords do not match. Please try again.' });
        return;
      }
      await signUpWithEmail(email, password, displayName || email.split('@')[0]);
    } else {
      await signInWithEmail(email, password);
    }

    if (!useAuthStore.getState().error) {
      onClose();
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phoneNumber) return;

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }

    const success = await sendPhoneOtp(formattedPhone, 'recaptcha-container');
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!otpCode) return;

    await verifyPhoneOtp(otpCode.trim());
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel border border-white/20 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Invisible Recaptcha Container for Phone Auth */}
        <div id="recaptcha-container"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-black">
              <LogIn className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {emailMode === 'signup' ? 'Sign Up to REPX' : 'Sign In to REPX'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">Sync your workout logs & PRs across devices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-300 text-xs font-bold animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Method Navigation Pills */}
        <div className="grid grid-cols-3 gap-1.5 glass-input p-1 rounded-2xl">
          <button
            onClick={() => {
              clearError();
              setAuthMethod('email');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'email' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            onClick={() => {
              clearError();
              setAuthMethod('phone');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'phone' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>

          <button
            onClick={() => {
              clearError();
              setAuthMethod('google');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'google' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Google</span>
          </button>
        </div>

        {/* 1. EMAIL / USERNAME & PASSWORD AUTH */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="text-zinc-400">
                {emailMode === 'signin' ? 'Sign in with your credentials' : 'Create a new account'}
              </span>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                }}
                className="text-blue-400 hover:underline font-extrabold"
              >
                {emailMode === 'signin' ? 'Register Now' : 'Have an account?'}
              </button>
            </div>

            {emailMode === 'signup' && (
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Username / Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Password Field with Eye Option */}
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password Field (Registration Alone) */}
            {emailMode === 'signup' && (
              <div className="relative animate-in slide-in-from-top-1">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-white transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-black py-3 rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{emailMode === 'signin' ? 'Sign In' : 'Sign Up / Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. PHONE NUMBER AUTH */}
        {authMethod === 'phone' && (
          <div className="space-y-3.5">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                <div className="text-xs text-zinc-400 font-bold px-1">
                  Enter your mobile phone number with country code (e.g. +91 9876543210):
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-bold tracking-wider"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-black py-3 rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <span>Sending OTP...</span> : <span>Send OTP Code</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 px-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OTP code sent to {phoneNumber}. Enter 6-digit code:</span>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-center text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-black tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 glass-input text-zinc-400 hover:text-white py-2.5 rounded-2xl text-xs font-bold"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#007AFF] hover:bg-blue-600 text-white font-black py-2.5 rounded-2xl text-xs shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. GOOGLE AUTH */}
        {authMethod === 'google' && (
          <div className="py-4 text-center space-y-4">
            <p className="text-xs text-zinc-300 font-medium max-w-xs mx-auto">
              Sign in with your Google account for one-click instant sync across web & mobile.
            </p>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
