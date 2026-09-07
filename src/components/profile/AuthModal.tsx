import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, LogOut, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, KeyRound, Tv, Sparkles, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    user, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    getUserPasscode,
    generateDevicePasscode,
    loginWithPasscode,
    logout 
  } = useAuth();

  const { setIsProfileModalOpen } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'passcode'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAuthModalOpen) {
      getUserPasscode().then((existingCode) => {
        if (existingCode) {
          setGeneratedCode(existingCode);
        }
      });
    }
  }, [user, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'passcode') {
        if (!passcode.trim() || passcode.trim().length !== 4) {
          setError('Please enter a 4-digit passcode.');
          setLoading(false);
          return;
        }
        await loginWithPasscode(passcode.trim());
        setSuccessMsg('Logged in via Passcode!');
      } else if (mode === 'signin') {
        await loginWithEmail(email, password);
        setSuccessMsg('Successfully signed in!');
      } else {
        if (!displayName.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, displayName);
        setSuccessMsg('Account created successfully!');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePasscode = async () => {
    setGenerating(true);
    setError(null);
    try {
      const code = await generateDevicePasscode();
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to generate device passcode.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* User Logged In Profile View & Device Pairing Code Generator */
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-20 h-20 rounded-full border-2 border-red-600 object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-red-600 flex items-center justify-center text-red-500 font-bold text-2xl">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{user.displayName || 'Logged In User'}</h3>
                <p className="text-sm text-zinc-400">{user.email || (user.isPasscodeSession ? 'Passcode Session Active' : '')}</p>
              </div>
            </div>

            {/* Smart TV / Device Pairing Box */}
            <div className="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
                <Tv className="w-4 h-4 text-red-500" />
                <span>Smart TV / Device Login Passcode</span>
              </div>
              <p className="text-xs text-zinc-400">
                Want to log in on your Smart TV or another device? Use your permanent 4-digit passcode below or click Regenerate Code to generate a new one.
              </p>

              {generatedCode ? (
                <div className="flex flex-col items-center justify-center p-4 bg-black/60 rounded-xl border border-red-900/40 text-center space-y-2">
                  <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Your TV Passcode</span>
                  <div className="text-4xl font-black font-mono tracking-[0.3em] text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    {generatedCode}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" /> Permanent Passcode (Active)
                  </span>
                  <button
                    onClick={handleGeneratePasscode}
                    disabled={generating}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Code
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGeneratePasscode}
                  disabled={generating}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {generating ? (
                    <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Generate 4-Digit Passcode
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400">
              <p className="flex items-center justify-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Firebase Sync Active
              </p>
              <p className="mt-1">Watch History and My List are synced to your account.</p>
            </div>

            <button
              onClick={async () => {
                await logout();
                setIsAuthModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : mode === 'passcode' ? (
          /* Enter Passcode View - Matching User Screenshot 2 */
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Enter Passcode</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your 4-digit passcode generated on your phone or PC.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 px-4 text-center text-2xl font-black tracking-[0.4em] text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/40 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'SUBMIT PASSCODE'
                )}
              </button>
            </form>

            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Sign In options
            </button>
          </div>
        ) : (
          /* Welcome Sign In / Sign Up View - Matching User Screenshot 1 */
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 font-['Permanent_Marker',cursive] text-xl">
                MP
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Welcome to MidnightPlay
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Login to watch your favorite movies, shows, anime & more — on all your devices.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Actions matching User's screenshot */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2.5 transition-all text-sm shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => { setMode('passcode'); setError(null); }}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-bold flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-red-500" />
                <span>Use Passcode to Login</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-zinc-800 w-full"></div>
              <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 font-semibold uppercase">Or Email Sign In</span>
            </div>

            {/* Email / Password Toggle */}
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {mode === 'signin' ? 'Sign In with Email' : 'Create Account'}
              </button>
            </form>

            <div className="text-center pt-2 flex flex-col items-center gap-2">
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="text-xs text-zinc-400 hover:text-white underline transition-colors cursor-pointer"
              >
                {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>

              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer pt-1"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                <span>Open App Settings & Profiles</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

