import React, { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";
import { Lock, X, Shield, Sparkles, CheckCircle2, KeyRound } from "lucide-react";

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, quickDemoLogin } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await login(username, password);
    setLoading(false);

    if (!success) {
      setError("Login failed. Check your credentials.");
    }
  };

  const handleRolePreset = (role: UserRole) => {
    quickDemoLogin(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Installation Sign In</h3>
              <p className="text-xs text-slate-500">Cloudflare Worker & R2 Security Boundary</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Architecture Note */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-facility-600" />
            <span>Zero-Knowledge Server KDF</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Passwords undergo 100,000 rounds of PBKDF2-SHA256 in your browser. The Worker receives only the derived hash, verifying it in constant time using HMAC.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Deriving Key & Verifying..." : "Sign In"}
          </button>
        </form>

        {/* Demo Role Presets */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Test Credentials (Demo Mode)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRolePreset("administrator")}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors"
            >
              <span>Administrator</span>
              <Shield className="w-3.5 h-3.5 text-purple-600" />
            </button>

            <button
              onClick={() => handleRolePreset("editor")}
              className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors"
            >
              <span>Editor</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            </button>

            <button
              onClick={() => handleRolePreset("reviewer")}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors"
            >
              <span>Reviewer</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <button
              onClick={() => handleRolePreset("viewer")}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors"
            >
              <span>Viewer</span>
              <span className="text-[10px] text-slate-500 font-mono">Read-only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
