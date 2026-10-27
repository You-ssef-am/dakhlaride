import React, { useState } from 'react';
import { UserRole, KycStatus, WebSocketLogEvent, UserProfile } from './types/ride';
import { INITIAL_USER } from './data/mockData';
import { Navbar, NavTab } from './components/Navbar';
import { LoginModal } from './components/auth/LoginModal';
import { DualPhoneSimulator } from './components/simulator/DualPhoneSimulator';
import { ArchitectureViewer } from './components/docs/ArchitectureViewer';
import { DatabaseSchemaViewer } from './components/docs/DatabaseSchemaViewer';
import { WebSocketSpecsViewer } from './components/docs/WebSocketSpecsViewer';
import { FlutterComponentViewer } from './components/docs/FlutterComponentViewer';
import { GearRentalViewer } from './components/rentals/GearRentalViewer';
import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import {
  Layers,
  Database,
  Radio,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  Mail,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('SIMULATOR');
  const [activeRole, setActiveRole] = useState<UserRole>('PASSENGER');
  const [kycStatus, setKycStatus] = useState<KycStatus>('APPROVED');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);

  const [wsLogs, setWsLogs] = useState<WebSocketLogEvent[]>([
    {
      id: 'init_0',
      event: 'system:init',
      correlationId: 'boot-dakhla-001',
      timestamp: Date.now() - 30000,
      sender: 'SERVER',
      summary: 'Passerelle WebSocket connectée (Redis Pub/Sub)',
      payload: { status: 'ONLINE', node: 'eu-west-dakhla', latency_ms: 18 },
    },
  ]);

  const handleLoginSuccess = (updatedData: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const handleLogWsEvent = (event: WebSocketLogEvent) => {
    setWsLogs((prev) => [event, ...prev.slice(0, 49)]); // keep last 50 events
  };

  const handleQuickToggleRole = () => {
    if (activeRole === 'PASSENGER') {
      if (kycStatus === 'APPROVED') {
        setActiveRole('DRIVER');
      } else {
        setCurrentTab('SIMULATOR');
      }
    } else {
      setActiveRole('PASSENGER');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following contract */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeRole={activeRole}
        onQuickToggleRole={handleQuickToggleRole}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Subtle Hero Kicker & Summary Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-900">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Plateforme VTC & Négociation de Prix Temps Réel</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Architecture logicielle unifiée <strong>Single Binary App</strong> (Passager & Conducteur) avec authentification Gmail/OTP, vérification de la Carte Nationale (CIN) et photo de profil du chauffeur.
            </p>
          </div>

          {/* Quick Metrics & User Session Tag */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser.email || 'Connexion Gmail'}</span>
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setCurrentTab('DATABASE')}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-semibold">Firebase Firestore</span>
            </button>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>PostGIS 3.4</span>
            </span>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
              title="Politique de Confidentialité conforme à la loi 09-08 / CNDP"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Loi 09-08 CNDP</span>
            </button>
            <span className="text-slate-700">·</span>
            <span>WebSockets Actifs</span>
          </div>
        </div>

        {/* Tab views */}
        {currentTab === 'SIMULATOR' && (
          <DualPhoneSimulator
            onLogWsEvent={handleLogWsEvent}
            activeRole={activeRole}
            onRoleChange={setActiveRole}
            kycStatus={kycStatus}
            onKycStatusChange={setKycStatus}
          />
        )}

        {currentTab === 'RENTALS' && (
          <GearRentalViewer
            userPointsBalance={currentUser.pointsBalance}
            onDeductPoints={(pts) =>
              setCurrentUser((prev) => ({
                ...prev,
                pointsBalance: Math.max(0, prev.pointsBalance - pts),
              }))
            }
          />
        )}

        {currentTab === 'ARCHITECTURE' && <ArchitectureViewer />}

        {currentTab === 'DATABASE' && <DatabaseSchemaViewer />}

        {currentTab === 'WEBSOCKETS' && (
          <WebSocketSpecsViewer
            logs={wsLogs}
            onClearLogs={() => setWsLogs([])}
          />
        )}

        {currentTab === 'FLUTTER_CODE' && <FlutterComponentViewer />}
      </main>

      {/* Login / Gmail Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Privacy Policy & CNDP Protection Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© 2026 Dakhla Ride Architecture Studio · Single Binary Multiplatform System</p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-amber-400/90 hover:text-amber-300 transition-colors underline underline-offset-4 flex items-center gap-1.5 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Politique de Confidentialité (Loi 09-08 & RGPD)</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Flutter Clean Architecture</span>
            <span>·</span>
            <span>PostgreSQL + PostGIS</span>
            <span>·</span>
            <span>Firebase Firestore</span>
            <span>·</span>
            <span>KYC Guard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
