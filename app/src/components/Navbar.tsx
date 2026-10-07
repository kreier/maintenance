import React from "react";
import type { LocaleCode } from "../types";
import { useAuth } from "../context/AuthContext";
import { Building2, Globe, Lock, Layers, LogOut, Shield } from "lucide-react";

interface NavbarProps {
  currentLocale: LocaleCode;
  onLocaleChange: (locale: LocaleCode) => void;
  activePath: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocale,
  onLocaleChange,
  activePath,
}) => {
  const { user, openLoginModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <a href="#/" className="flex items-center gap-2.5 text-slate-900 font-bold text-lg hover:text-facility-600 transition-colors">
              <span className="p-1.5 bg-facility-50 border border-facility-500/20 text-facility-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </span>
              <span>Maintenance</span>
            </a>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#/"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activePath === "" || activePath === "/"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Overview
              </a>
              <a
                href="#/equipment"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activePath.startsWith("/equipment") || activePath.startsWith("/objects")
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Equipment
              </a>
              <a
                href="#/maintenance"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activePath.startsWith("/maintenance")
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Maintenance
              </a>
            </nav>
          </div>

          {/* Location Selector, Language, Auth Button */}
          <div className="flex items-center gap-3">
            {/* Location selector */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              <Layers className="w-3.5 h-3.5 text-facility-600" />
              <span>Location:</span>
              <span className="font-semibold text-slate-900">Community Conference Hall (Demo)</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {(["en", "vi", "ko"] as LocaleCode[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => onLocaleChange(loc)}
                  className={`px-2 py-1 rounded transition-colors uppercase ${
                    currentLocale === loc
                      ? "bg-white text-facility-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* User Session / Sign In Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-bold text-slate-800">{user.username}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
