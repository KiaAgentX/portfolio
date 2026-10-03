import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Key, UserCheck, HelpCircle, Lock, Cpu, Globe } from 'lucide-react';

interface LoginGateProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setErrorText(data.error || "The temple guards barred your entry. Please verify credentials.");
      }
    } catch (err: any) {
      console.error(err);
      // Fallback local check in case server is reloading or offline
      if (username === 'admin' && password === 'ImX') {
        onLoginSuccess("gqr-local-fallback-secured-token");
      } else {
        setErrorText("Server communication barrier. Please check your credentials or network.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-[#d1d1d1] font-sans antialiased flex flex-col items-center justify-center p-4 relative overflow-hidden bg-grid">
      {/* Absolute blurry ambient spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Temple Entrance Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#09090a] border border-border-medium rounded-2xl relative overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-brand-orange to-transparent"></div>

        <div className="text-center space-y-2">
          {/* Logo Badge */}
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center glow-orange-sm mb-4">
            <span className="text-black font-extrabold text-base tracking-wider font-mono">GQR</span>
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest text-brand-orange uppercase">
            SECURE ADMISSION CHIEF PORTAL
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
            Greek Oracle GQR Suite
          </h2>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Please present your encryption key credentials to clear validation gateways.
          </p>
        </div>

        {errorText && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-brand-orange/5 border border-brand-orange/20 rounded-xl flex items-start gap-2.5"
          >
            <ShieldAlert className="h-4.5 w-4.5 text-brand-orange shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <span className="text-[11px] font-mono text-brand-orange font-bold uppercase block">Validation Denied</span>
              <span className="text-xs text-zinc-400 font-sans leading-snug">{errorText}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-500 tracking-wider">GATE KEEPER IDENTITY</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Enter user name (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#111113] border border-border-dark pl-10 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-orange-dark transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-zinc-500 tracking-wider">SECRET CRYPTOGRAPHIC ENCRYPTION</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                <Key className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="Enter validation secret (e.g. ImX)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#111113] border border-border-dark pl-10 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-orange-dark transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:from-brand-orange-light hover:to-brand-orange text-black font-bold text-center text-xs rounded-xl shadow-lg shadow-brand-orange/10 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Present Credentials & Enter</span>
              </>
            )}
          </button>
        </form>

        <div className="border-t border-border-dark/60 pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Cpu className="h-3.5 w-3.5" />
            <span>Default Test Keys: admin // ImX</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
