import React from 'react';
import { Car, Smartphone, Zap } from 'lucide-react';
import { UserRole } from '../types/ride';

export type NavTab = 'SIMULATOR' | 'RENTALS' | 'ARCHITECTURE' | 'DATABASE' | 'WEBSOCKETS' | 'FLUTTER_CODE';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeRole: UserRole;
  onQuickToggleRole: () => void;
  currentUser: { email?: string; fullName: string; avatarUrl: string };
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  onQuickToggleRole,
  currentUser,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single element brand wordmark */}
        <div
          onClick={() => onTabChange('SIMULATOR')}
          className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Car className="w-4 h-4" />
          </div>
          <span>Dakhla Ride</span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onTabChange('SIMULATOR')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'SIMULATOR'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Simulateur VTC
          </button>

          <button
            onClick={() => onTabChange('RENTALS')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'RENTALS'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            <span>Location Matériel</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              Tourisme
            </span>
          </button>

          <button
            onClick={() => onTabChange('ARCHITECTURE')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'ARCHITECTURE'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Architecture Mobile
          </button>

          <button
            onClick={() => onTabChange('DATABASE')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'DATABASE'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Base Firebase & SQL
          </button>

          <button
            onClick={() => onTabChange('WEBSOCKETS')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'WEBSOCKETS'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            WebSockets
          </button>

          <button
            onClick={() => onTabChange('FLUTTER_CODE')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'FLUTTER_CODE'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Composant Flutter
          </button>
        </nav>

        {/* Zone 3: 1 primary action with Google Login trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Account / Google Login Pill */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full transition-colors group text-left"
            title="Gérer le compte Gmail"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-amber-500"
            />
            <div className="hidden sm:block text-[11px] leading-tight">
              <span className="font-semibold text-white group-hover:text-amber-400 block truncate max-w-[120px]">
                {currentUser.email || currentUser.fullName}
              </span>
            </div>
          </button>

          {/* Quick Role Toggle */}
          <button
            onClick={onQuickToggleRole}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeRole === 'DRIVER'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{activeRole === 'DRIVER' ? 'Conducteur' : 'Passager'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav strip for small screens */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-slate-900 border-t border-slate-800 text-[11px] overflow-x-auto gap-2">
        <button
          onClick={() => onTabChange('SIMULATOR')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'SIMULATOR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Simulateur
        </button>
        <button
          onClick={() => onTabChange('RENTALS')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'RENTALS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Location
        </button>
        <button
          onClick={() => onTabChange('ARCHITECTURE')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'ARCHITECTURE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Arborescence
        </button>
        <button
          onClick={() => onTabChange('DATABASE')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'DATABASE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Firebase & SQL
        </button>
        <button
          onClick={() => onTabChange('WEBSOCKETS')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'WEBSOCKETS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          WebSockets
        </button>
        <button
          onClick={() => onTabChange('FLUTTER_CODE')}
          className={`px-2.5 py-1 rounded-lg shrink-0 ${
            currentTab === 'FLUTTER_CODE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Flutter
        </button>
      </div>
    </header>
  );
};
