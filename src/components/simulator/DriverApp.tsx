import React, { useState } from 'react';
import {
  RideRequest,
  WalletTransaction,
  UserProfile,
  RideStatus,
} from '../../types/ride';
import { InteractiveMap } from './InteractiveMap';
import {
  Car,
  Navigation,
  DollarSign,
  TrendingUp,
  Wallet,
  CheckCircle,
  XCircle,
  Plus,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  KeyRound,
  ArrowUpRight,
  AlertCircle,
  EyeOff,
  Flame,
  Radio,
} from 'lucide-react';

interface DriverAppProps {
  currentRide: RideRequest | null;
  driverProfile: UserProfile;
  transactions: WalletTransaction[];
  onAcceptClientPrice: (rideId: string) => void;
  onSubmitCounterOffer: (rideId: string, counterPrice: number) => void;
  onIgnoreRide: (rideId: string) => void;
  onSignalArrival: () => void;
  onValidateOtpAndStartTrip: (otpInput: string) => boolean;
  onCompleteTrip: () => void;
  onOpenChat: () => void;
  onOpenRibModal: () => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({
  currentRide,
  driverProfile,
  transactions,
  onAcceptClientPrice,
  onSubmitCounterOffer,
  onIgnoreRide,
  onSignalArrival,
  onValidateOtpAndStartTrip,
  onCompleteTrip,
  onOpenChat,
  onOpenRibModal,
}) => {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'WALLET'>('RADAR');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [customCounterInput, setCustomCounterInput] = useState<number | null>(null);

  const status: RideStatus = currentRide ? currentRide.status : 'IDLE';

  // Calculate wallet summary
  const totalBalance = transactions.length > 0 ? transactions[0].balanceAfter : 477.25;
  const todayEarnings = transactions
    .filter((t) => t.type === 'RIDE_EARNING')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalCommissions = transactions
    .filter((t) => t.type === 'PLATFORM_FEE')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const handleOtpKey = (digit: string) => {
    if (otpInput.length < 4) {
      const next = otpInput + digit;
      setOtpInput(next);
      setOtpError(false);
      if (next.length === 4) {
        const ok = onValidateOtpAndStartTrip(next);
        if (!ok) {
          setOtpError(true);
        }
      }
    }
  };

  const handleBackspace = () => {
    setOtpInput((prev) => prev.slice(0, -1));
    setOtpError(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Driver Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={driverProfile.driverPhotoUrl || driverProfile.avatarUrl}
              alt={driverProfile.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{driverProfile.fullName}</span>
              <span className="text-[10px] text-emerald-400 font-medium">· En ligne</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="text-amber-400 font-semibold">{driverProfile.rating} ★</span>
              <span>·</span>
              <span className="font-mono text-slate-300">CIN: {driverProfile.cinNumber || 'OD-78921'}</span>
            </div>
          </div>
        </div>

        {/* Tab switcher: Radar vs Wallet */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('RADAR')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              activeTab === 'RADAR'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WALLET')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              activeTab === 'WALLET'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portefeuille
          </button>
        </div>
      </div>

      {activeTab === 'RADAR' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map Zone */}
          <div className="p-3 pb-2 shrink-0">
            <InteractiveMap
              origin={currentRide?.origin}
              destination={currentRide?.destination}
              status={status}
              vehicleType={currentRide?.vehicleType || 'VOITURE'}
              showOtherDrivers={false}
            />
          </div>

          {/* Dynamic Feed Body */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
            {/* NO ACTIVE REQUEST / IDLE RADAR */}
            {(!currentRide || currentRide.status === 'IDLE') && (
              <div className="p-8 text-center space-y-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Radar actif sur zone Dakhla</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                    En attente de demandes passagers à proximité. Les courses s'afficheront ici avec le prix proposé et les options de contre-proposition.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    GPS TRACKER: LAT 23.7183° LNG -15.9322° · EMISSION WEBSOCKET 4s
                  </span>
                </div>
              </div>
            )}

            {/* NEW RIDE REQUEST RECEIVED: BIDDING SYSTEM */}
            {currentRide && (currentRide.status === 'SEARCHING' || currentRide.status === 'OFFERS_RECEIVED') && (
              <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-3.5 space-y-3 shadow-xl shadow-amber-500/5 animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {currentRide.passengerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{currentRide.passengerName}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">★ {currentRide.passengerRating}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Navigation className="w-3 h-3 text-slate-500" />
                        <span>Distance : 0.9 km (3 min d'approche)</span>
                      </div>
                    </div>
                  </div>

                  {/* Client offer price */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Offre Passager</span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {currentRide.passengerPrice} <span className="text-xs">MAD</span>
                    </div>
                  </div>
                </div>

                {/* Pickup and Destination Details */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <span className="font-medium truncate">{currentRide.origin.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="font-medium truncate">{currentRide.destination.name}</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1 border-t border-slate-800/80">
                    <span>Parcours : {currentRide.distanceKm} km (~{currentRide.durationMinutes} min)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold font-mono">
                        {currentRide.vehicleType}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold font-mono">
                        {currentRide.tripType === 'SHARED' ? `Partagée (${currentRide.seatsBooked || 1} pl.)` : 'Course Seule'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Counter Offer Buttons (+5 DH, +10 DH, +15 DH) */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Proposer une contre-offre rapide :
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onSubmitCounterOffer(currentRide.id, currentRide.passengerPrice + 5)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors flex items-center justify-center gap-1"
                    >
                      +{5} MAD <span className="text-[10px] text-slate-400">({currentRide.passengerPrice + 5})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitCounterOffer(currentRide.id, currentRide.passengerPrice + 10)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors flex items-center justify-center gap-1"
                    >
                      +{10} MAD <span className="text-[10px] text-slate-400">({currentRide.passengerPrice + 10})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitCounterOffer(currentRide.id, currentRide.passengerPrice + 15)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors flex items-center justify-center gap-1"
                    >
                      +{15} MAD <span className="text-[10px] text-slate-400">({currentRide.passengerPrice + 15})</span>
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onAcceptClientPrice(currentRide.id)}
                    className="py-3 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accepter ({currentRide.passengerPrice} DH)
                  </button>

                  <button
                    type="button"
                    onClick={() => onIgnoreRide(currentRide.id)}
                    className="py-3 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    Ignorer / Passer
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE TRIP: EN ROUTE TO PICKUP (ACCEPTED) */}
            {currentRide && currentRide.status === 'ACCEPTED' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
                      1. En route vers le passager
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      {currentRide.origin.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{currentRide.origin.address}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-lg font-black text-amber-400">
                      {currentRide.finalPrice} MAD
                    </span>
                    <span className="text-[10px] text-slate-400 block">Prix convenu</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-slate-300">Temps d'arrivée estimé :</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">~3 minutes</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    Tchat client
                  </button>

                  <button
                    type="button"
                    onClick={onSignalArrival}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Je suis arrivé sur place
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE TRIP: ARRIVED AT PICKUP -> Saisie du Code OTP du passager (CRITICAL REQUIREMENT) */}
            {currentRide && currentRide.status === 'ARRIVED' && (
              <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 space-y-3.5 shadow-xl">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-1">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Validation du départ (Code OTP)</h4>
                  <p className="text-[11px] text-slate-400">
                    Demandez le code à 4 chiffres affiché sur le téléphone du client
                  </p>
                </div>

                {/* OTP Display slots */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = otpInput[idx] || '';
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-xl border flex items-center justify-center text-xl font-mono font-bold transition-all ${
                          digit
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                            : 'bg-slate-950 text-slate-600 border-slate-800'
                        } ${otpError ? 'border-rose-500 text-rose-400 bg-rose-950/20' : ''}`}
                      >
                        {digit}
                      </div>
                    );
                  })}
                </div>

                {otpError && (
                  <p className="text-[11px] text-rose-400 text-center flex items-center justify-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Code erroné. Veuillez vérifier avec le passager.
                  </p>
                )}

                {/* Numeric Keypad for OTP entry */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === 'C') setOtpInput('');
                        else if (k === '⌫') handleBackspace();
                        else handleOtpKey(k);
                      }}
                      className="py-2.5 bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-mono font-bold rounded-xl text-sm border border-slate-800 transition-colors flex items-center justify-center"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <div className="text-center pt-1">
                  <span className="text-[10px] text-slate-500">
                    (Astuce démonstrateur : le code du passager est <strong>{currentRide.otpCode}</strong>)
                  </span>
                </div>
              </div>
            )}

            {/* ACTIVE TRIP: IN PROGRESS (TRIP TO DESTINATION) */}
            {currentRide && (currentRide.status === 'IN_PROGRESS' || currentRide.status === 'COMPLETED') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                      {currentRide.status === 'COMPLETED' ? '2. Course Terminée' : '2. Course en cours'}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      Destination : {currentRide.destination.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{currentRide.destination.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-extrabold text-amber-400">
                      {currentRide.finalPrice} MAD
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {currentRide.paymentMethod === 'POINTS' ? 'En Points' : 'En Espèces'}
                    </span>
                  </div>
                </div>

                {/* Payment notice */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                  <span>Règlement :</span>
                  <span className="font-semibold text-amber-400">
                    {currentRide.paymentMethod === 'POINTS'
                      ? 'Points Dakhla (Crédit portefeuille direct)'
                      : 'Espèces directes du passager'}
                  </span>
                </div>

                {/* Live Navigation simulation */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Navigation className="w-5 h-5 rotate-45" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-white">
                      {currentRide.status === 'COMPLETED'
                        ? 'Arrivé à destination'
                        : 'Dans 200m, continuer sur RN1'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {currentRide.status === 'COMPLETED'
                        ? 'Point de dépose atteint'
                        : 'Direction Lagune Nord / Dakhla Attitude'}
                    </p>
                  </div>
                </div>

                {/* Complete Trip CTA or Waiting Passenger Validation */}
                {currentRide.status === 'IN_PROGRESS' ? (
                  <button
                    type="button"
                    onClick={onCompleteTrip}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Signaler l'arrivée à destination ({currentRide.finalPrice} MAD)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-center space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Arrivée signalée au passager
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {currentRide.passengerConfirmedCompletion
                        ? 'Le passager a confirmé et validé la fin de la course !'
                        : 'En attente de la confirmation passager sur son smartphone...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* WALLET & COMMISSION MANAGEMENT DASHBOARD (CRITICAL REQUIREMENT) */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Driver Identity Card with Photo, Gmail & CIN */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={driverProfile.driverPhotoUrl || driverProfile.avatarUrl}
                alt={driverProfile.fullName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
              />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{driverProfile.fullName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    KYC Approuvé
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {driverProfile.email || 'yassine.driver.dakhla@gmail.com'}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="text-amber-400 font-mono font-semibold">CIN: {driverProfile.cinNumber || 'OD-78921'}</span>
                  <span>·</span>
                  <span>Véhicule: 12-A-89452</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Statut</span>
              <span className="text-xs font-bold text-emerald-400">Actif</span>
            </div>
          </div>

          {/* Main Wallet Balance Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Solde Portefeuille Chauffeur</span>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-tight mt-1">
                  {totalBalance.toFixed(2)} <span className="text-sm font-semibold text-slate-300">MAD</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Courses du jour :</span>
                <p className="font-bold text-emerald-400 font-mono">+{todayEarnings.toFixed(2)} MAD</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Commission plateforme (15%) :</span>
                <p className="font-bold text-rose-400 font-mono">-{totalCommissions.toFixed(2)} MAD</p>
              </div>
            </div>
          </div>

          {/* Bank RIB Configuration & Withdrawal Card */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Compte Bancaire (RIB)</h4>
                  <p className="text-[10px] text-slate-400">{driverProfile.bankName || 'Attijariwafa Bank'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenRibModal}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                Gérer mon RIB
              </button>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-amber-300 font-bold border border-slate-800 flex items-center justify-between">
              <span>{driverProfile.bankRib || '230 780 4561234567890123 45'}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                RIB Validé
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenRibModal}
              className="w-full mt-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Transférer vers mon compte bancaire (Virement)</span>
            </button>
          </div>

          {/* Platform fee policy notice */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Commission transparente à 15%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Le passager paie en direct en espèces. La commission plateforme est automatiquement déduite de votre portefeuille virtuel sans blocage intempestif.
            </p>
          </div>

          {/* Transactions Ledger */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white block">Historique des transactions :</span>
            <div className="space-y-1.5">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-medium text-white text-[11px]">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {tx.amount.toFixed(2)} MAD
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono">
                        Solde: {tx.balanceAfter.toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
