import React, { useState } from 'react';
import { Lock, Key, X, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { ADMIN_SECRET_PASSWORD } from '../config/adminConfig';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_SECRET_PASSWORD) {
      setError(false);
      setPassword('');
      onLoginSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl glass-card border border-white/20 bg-[#0a0a14]/95 p-6 shadow-2xl transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-syne">
                Admin Authentication
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Enter secret key to unlock creator controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-gray-300 mb-1.5">
              Secret Password
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter admin password..."
                autoFocus
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/60 border text-sm text-white focus:outline-none transition-all font-mono ${
                  error
                    ? 'border-red-500 ring-1 ring-red-500 text-red-200'
                    : 'border-white/15 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="mt-1.5 text-[11px] text-red-400 font-mono flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Incorrect secret password. Access denied.
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
