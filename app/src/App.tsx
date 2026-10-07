import React, { useState, useEffect } from "react";
import type { LocaleCode } from "./types";
import { Navbar } from "./components/Navbar";
import { FacilityOverviewPage } from "./pages/FacilityOverviewPage";
import { EquipmentListPage } from "./pages/EquipmentListPage";
import { ObjectDetailPage } from "./pages/ObjectDetailPage";
import { RoomDetailPage } from "./pages/RoomDetailPage";
import { MaintenanceDashboardPage } from "./pages/MaintenanceDashboardPage";

export const App: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>("en");
  const [hash, setHash] = useState<string>(window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#/");
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Parse hash route
  const normalizedPath = hash.replace(/^#/, "") || "/";

  const renderContent = () => {
    if (normalizedPath === "/" || normalizedPath === "") {
      return <FacilityOverviewPage currentLocale={currentLocale} />;
    }

    if (normalizedPath === "/equipment") {
      return <EquipmentListPage currentLocale={currentLocale} />;
    }

    if (normalizedPath === "/maintenance") {
      return <MaintenanceDashboardPage currentLocale={currentLocale} />;
    }

    if (normalizedPath.startsWith("/objects/")) {
      const objectId = normalizedPath.replace("/objects/", "").split("?")[0];
      return <ObjectDetailPage objectId={objectId} currentLocale={currentLocale} />;
    }

    if (normalizedPath.startsWith("/rooms/")) {
      const roomId = normalizedPath.replace("/rooms/", "").split("?")[0];
      return <RoomDetailPage roomId={roomId} currentLocale={currentLocale} />;
    }

    // Fallback 404
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500">The requested view does not exist.</p>
        <a
          href="#/"
          className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Overview
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentLocale={currentLocale}
        onLocaleChange={setCurrentLocale}
        activePath={normalizedPath}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-semibold text-slate-700">
            kreier/maintenance — Multilingual Facility Documentation Platform
          </p>
          <p>
            Open Source • Powered by Vite, React & Cloudflare R2 • Public Synthetic Demo
          </p>
        </div>
      </footer>
    </div>
  );
};
export default App;
