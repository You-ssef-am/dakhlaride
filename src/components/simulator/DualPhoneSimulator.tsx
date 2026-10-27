import React, { useState } from 'react';
import {
  UserProfile,
  RideRequest,
  DriverOffer,
  ChatMessage,
  WalletTransaction,
  KycStatus,
  WebSocketLogEvent,
  UserRole,
} from '../../types/ride';
import {
  INITIAL_USER,
  INITIAL_DRIVER_USER,
  INITIAL_TRANSACTIONS,
  MOCK_COMPETING_DRIVERS,
} from '../../data/mockData';
import { PassengerApp } from './PassengerApp';
import { DriverApp } from './DriverApp';
import { KycModal } from './KycModal';
import { ChatModal } from './ChatModal';
import { SosModal } from './SosModal';
import { PassengerWalletModal } from '../wallet/PassengerWalletModal';
import { DriverRibModal } from '../wallet/DriverRibModal';
import { SubscriptionsModal } from '../subscriptions/SubscriptionsModal';
import {
  Smartphone,
  Columns2,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ArrowRightLeft,
  ShieldCheck,
  Check,
  Zap,
  Info,
  Coins,
  Landmark,
  Flame,
} from 'lucide-react';
import {
  saveRideToFirestore,
  saveOfferToFirestore,
  saveMessageToFirestore,
  saveKycSubmission,
  saveTransactionToFirestore,
  syncUserToFirestore,
  testConnection,
} from '../../lib/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';

interface DualPhoneSimulatorProps {
  onLogWsEvent?: (event: WebSocketLogEvent) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  kycStatus: KycStatus;
  onKycStatusChange: (status: KycStatus) => void;
}

export const DualPhoneSimulator: React.FC<DualPhoneSimulatorProps> = ({
  onLogWsEvent,
  activeRole,
  onRoleChange,
  kycStatus,
  onKycStatusChange,
}) => {
  // Simulator display mode: 'SPLIT' (dual phones side-by-side) or 'SINGLE' (single unified mobile device)
  const [layoutMode, setLayoutMode] = useState<'SPLIT' | 'SINGLE'>('SPLIT');

  // Modals state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isPassengerWalletOpen, setIsPassengerWalletOpen] = useState(false);
  const [isDriverRibOpen, setIsDriverRibOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);

  // User Profiles
  const [passengerUser, setPassengerUser] = useState<UserProfile>(INITIAL_USER);
  const [driverProfile, setDriverProfile] = useState<UserProfile>(INITIAL_DRIVER_USER);

  // Core synchronized application state
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [driverOffers, setDriverOffers] = useState<DriverOffer[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isFirebaseLive, setIsFirebaseLive] = useState(true);

  // Sync users to Firestore on initial boot
  React.useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseLive(connected);
      if (connected) {
        syncUserToFirestore(passengerUser);
        syncUserToFirestore(driverProfile);
      }
    });
  }, []);

  // Helper to log WS events
  const emitWsLog = (
    event: string,
    sender: 'PASSENGER' | 'DRIVER' | 'SERVER',
    summary: string,
    payload: any
  ) => {
    const logItem: WebSocketLogEvent = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      event,
      correlationId: 'corr_' + Math.random().toString(36).substring(2, 8),
      timestamp: Date.now(),
      sender,
      summary,
      payload,
    };
    if (onLogWsEvent) {
      onLogWsEvent(logItem);
    }
  };

  // 1. Passenger publishes a ride request (with Payment Method)
  const handlePublishRide = (data: any) => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newRide: RideRequest = {
      id: 'ride_' + Math.random().toString(36).substring(2, 7),
      passengerId: passengerUser.id,
      passengerName: passengerUser.fullName,
      passengerRating: passengerUser.rating,
      origin: data.origin,
      destination: data.destination,
      recommendedPrice: data.recommendedPrice,
      passengerPrice: data.proposedPrice,
      status: 'SEARCHING',
      otpCode: generatedOtp,
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      paymentMethod: data.paymentMethod || 'POINTS',
      vehicleType: data.vehicleType || 'VOITURE',
      tripType: data.tripType || 'SOLO',
      seatsBooked: data.seatsBooked || 1,
      createdAt: Date.now(),
    };

    setCurrentRide(newRide);
    // Write directly to Firebase Firestore
    saveRideToFirestore(newRide);

    emitWsLog('ride:create', 'PASSENGER', `Nouvelle course publiée (${data.proposedPrice} MAD · ${data.vehicleType} · ${data.tripType === 'SHARED' ? 'Partagée' : 'Solo'})`, {
      ride_id: newRide.id,
      origin: newRide.origin,
      destination: newRide.destination,
      passenger_price: newRide.passengerPrice,
      vehicle_type: newRide.vehicleType,
      trip_type: newRide.tripType,
      payment_method: newRide.paymentMethod,
      otp_hash: 'sha256_salted_secret',
      firebase_synced: true,
    });

    emitWsLog('ride:broadcast', 'SERVER', `Diffusion PostGIS & Firestore (Zone Dakhla)`, {
      ride_id: newRide.id,
      drivers_targeted: 4,
      algorithm: 'ST_DWithin',
    });

    // Populate realistic driver offers after slight realistic delay
    setTimeout(() => {
      const initialOffers = MOCK_COMPETING_DRIVERS.map((d) => ({
        ...d,
        rideId: newRide.id,
        originalPrice: newRide.passengerPrice,
      }));
      setDriverOffers(initialOffers);
      const withOffers: RideRequest = { ...newRide, status: 'OFFERS_RECEIVED' };
      setCurrentRide(withOffers);
      // Persist in Firestore
      saveRideToFirestore(withOffers);
      initialOffers.forEach((off) => saveOfferToFirestore(off));

      emitWsLog(
        'ride:offer:received',
        'SERVER',
        `3 offres chauffeurs transmises au passager & enregistrées dans Firestore`,
        { offers_count: 3 }
      );
    }, 1200);
  };

  // Recharging passenger points (1 Point = 1 MAD)
  const handleRechargePoints = (pointsToAdd: number, amountPaidMAD: number) => {
    setPassengerUser((prev) => ({
      ...prev,
      pointsBalance: prev.pointsBalance + pointsToAdd,
    }));

    emitWsLog('passenger:points:recharged', 'PASSENGER', `Recharge de ${pointsToAdd} Points effectuée (${amountPaidMAD} MAD via CMI)`, {
      points_added: pointsToAdd,
      amount_mad: amountPaidMAD,
      new_balance: passengerUser.pointsBalance + pointsToAdd,
    });
  };

  // Saving driver bank RIB
  const handleSaveRib = (rib: string, bankName: string, accountHolder: string) => {
    setDriverProfile((prev) => ({
      ...prev,
      bankRib: rib,
      bankName: bankName,
      bankAccountHolder: accountHolder,
    }));

    emitWsLog('driver:rib:updated', 'DRIVER', `Coordonnées bancaires (RIB) enregistrées`, {
      bank: bankName,
      rib_masked: rib.slice(0, 7) + '••••••••' + rib.slice(-4),
      titulaire: accountHolder,
    });
  };

  // Driver requesting balance payout to his bank RIB
  const handleRequestPayout = (amount: number, rib: string, bankName: string) => {
    const currentBal = transactions[0]?.balanceAfter || 477.25;
    const newTx: WalletTransaction = {
      id: 'tx_payout_' + Math.random().toString(36).substring(2, 7),
      userId: driverProfile.id,
      amount: -amount,
      type: 'DRIVER_PAYOUT',
      description: `Virement bancaire vers ${bankName} (${rib.slice(-6)})`,
      balanceAfter: Math.max(0, currentBal - amount),
      date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setTransactions([newTx, ...transactions]);

    emitWsLog('driver:payout:initiated', 'DRIVER', `Demande de virement de ${amount} MAD vers RIB`, {
      amount,
      rib,
      bank: bankName,
      remaining_balance: Math.max(0, currentBal - amount),
    });
  };

  // Passenger confirms that the trip is completed & rates driver (CRITICAL REQUIREMENT)
  const handleConfirmPassengerCompletion = (rating: number) => {
    if (!currentRide) return;

    const finalAmount = currentRide.finalPrice || currentRide.passengerPrice;

    // If paid by points, deduct points from passenger balance
    if (currentRide.paymentMethod === 'POINTS') {
      setPassengerUser((prev) => ({
        ...prev,
        pointsBalance: Math.max(0, prev.pointsBalance - finalAmount),
      }));
    }

    const updatedRide: RideRequest = {
      ...currentRide,
      passengerConfirmedCompletion: true,
      passengerRatingGiven: rating,
    };

    setCurrentRide(updatedRide);
    saveRideToFirestore(updatedRide);

    emitWsLog(
      'passenger:ride:confirmed',
      'PASSENGER',
      `Fin de course confirmée par le passager (Note : ${rating}★ · Règlement ${finalAmount} ${currentRide.paymentMethod === 'POINTS' ? 'Points' : 'DH'})`,
      {
        ride_id: currentRide.id,
        rating,
        payment_method: currentRide.paymentMethod,
        amount_paid: finalAmount,
      }
    );
  };

  // 2. Driver submits a counter-offer
  const handleSubmitCounterOffer = (rideId: string, counterPrice: number) => {
    if (!currentRide) return;

    const myOffer: DriverOffer = {
      id: 'off_my_driver',
      rideId,
      driverId: INITIAL_DRIVER_USER.id,
      driverName: INITIAL_DRIVER_USER.fullName,
      driverAvatar: INITIAL_DRIVER_USER.avatarUrl,
      driverRating: INITIAL_DRIVER_USER.rating,
      totalTrips: INITIAL_DRIVER_USER.totalRides,
      vehicle: {
        id: 'veh_00',
        driverId: INITIAL_DRIVER_USER.id,
        type: currentRide.vehicleType || 'VOITURE',
        make: 'Toyota',
        model: 'Corolla',
        color: 'Gris Métallisé',
        licensePlate: '12-A-89452',
        year: 2023,
        isActive: true,
      },
      offeredPrice: counterPrice,
      originalPrice: currentRide.passengerPrice,
      etaMinutes: 3,
      status: 'COUNTERED',
      createdAt: Date.now(),
      distanceKm: 0.9,
    };

    setDriverOffers((prev) => [myOffer, ...prev.filter((o) => o.id !== 'off_my_driver')]);
    saveOfferToFirestore(myOffer);

    emitWsLog(
      'driver:offer:submit',
      'DRIVER',
      `Contre-proposition soumise : ${counterPrice} MAD (Firestore sync)`,
      {
        ride_id: rideId,
        offered_price: counterPrice,
        eta_minutes: 3,
      }
    );
  };

  // 3. Driver accepts at client's initial price
  const handleAcceptClientPrice = (rideId: string) => {
    if (!currentRide) return;
    handleSubmitCounterOffer(rideId, currentRide.passengerPrice);
  };

  // 4. Driver ignores the ride
  const handleIgnoreRide = (rideId: string) => {
    emitWsLog('driver:ride:ignore', 'DRIVER', `Course masquée par le chauffeur`, { ride_id: rideId });
  };

  // 5. Passenger selects and accepts a driver offer
  const handleAcceptOffer = (offerId: string) => {
    const selected = driverOffers.find((o) => o.id === offerId) || driverOffers[0];
    if (!currentRide || !selected) return;

    const updatedRide: RideRequest = {
      ...currentRide,
      status: 'ACCEPTED',
      finalPrice: selected.offeredPrice,
      selectedOfferId: offerId,
      driver: {
        id: selected.driverId,
        name: selected.driverName,
        rating: selected.driverRating,
        phone: '+212 6 72 88 99 00',
        avatar: selected.driverAvatar,
        vehicle: selected.vehicle,
      },
    };

    setCurrentRide(updatedRide);
    saveRideToFirestore(updatedRide);

    emitWsLog('passenger:offer:accept', 'PASSENGER', `Offre validée (${selected.driverName}) & enregistrée dans Firestore`, {
      ride_id: currentRide.id,
      offer_id: offerId,
      final_price: selected.offeredPrice,
    });

    emitWsLog('ride:matched', 'SERVER', `Attribution course confirmée & code OTP généré`, {
      ride_id: currentRide.id,
      driver_id: selected.driverId,
      otp_code: currentRide.otpCode,
    });
  };

  // 6. Driver signals arrival at pickup
  const handleSignalArrival = () => {
    if (!currentRide) return;
    const updated: RideRequest = { ...currentRide, status: 'ARRIVED' };
    setCurrentRide(updated);
    saveRideToFirestore(updated);

    emitWsLog('driver:status:arrived', 'DRIVER', `Chauffeur arrivé au point de prise en charge`, {
      ride_id: currentRide.id,
    });
  };

  // 7. Driver inputs and validates Passenger OTP code
  const handleValidateOtpAndStartTrip = (inputOtp: string): boolean => {
    if (!currentRide) return false;

    if (inputOtp === currentRide.otpCode) {
      const updated: RideRequest = { ...currentRide, status: 'IN_PROGRESS' };
      setCurrentRide(updated);
      saveRideToFirestore(updated);

      emitWsLog('driver:otp:verify', 'DRIVER', `Code OTP validé (${inputOtp}) - Départ course Firestore`, {
        ride_id: currentRide.id,
        otp_status: 'SUCCESS',
      });
      return true;
    } else {
      emitWsLog('driver:otp:verify', 'DRIVER', `Échec code OTP invalide (${inputOtp})`, {
        ride_id: currentRide.id,
        otp_status: 'INVALID',
      });
      return false;
    }
  };

  // 8. Driver completes the trip
  const handleCompleteTrip = () => {
    if (!currentRide) return;

    const finalAmount = currentRide.finalPrice || currentRide.passengerPrice;
    const commission = finalAmount * 0.15; // 15% platform fee
    const currentBalance = transactions[0]?.balanceAfter || 477.25;

    const newTxEarning: WalletTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 7),
      userId: INITIAL_DRIVER_USER.id,
      rideId: currentRide.id,
      amount: finalAmount,
      type: 'RIDE_EARNING',
      description: `Course ${currentRide.origin.name.split(' ')[0]} -> ${currentRide.destination.name.split(' ')[0]}`,
      balanceAfter: currentBalance + finalAmount,
      date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newTxFee: WalletTransaction = {
      id: 'tx_fee_' + Math.random().toString(36).substring(2, 7),
      userId: INITIAL_DRIVER_USER.id,
      rideId: currentRide.id,
      amount: -commission,
      type: 'PLATFORM_FEE',
      description: `Commission plateforme 15% (${currentRide.id})`,
      balanceAfter: currentBalance + finalAmount - commission,
      date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setTransactions([newTxFee, newTxEarning, ...transactions]);
    const updated: RideRequest = { ...currentRide, status: 'COMPLETED' };
    setCurrentRide(updated);
    saveRideToFirestore(updated);
    saveTransactionToFirestore(INITIAL_DRIVER_USER.id, newTxEarning);
    saveTransactionToFirestore(INITIAL_DRIVER_USER.id, newTxFee);

    emitWsLog('ride:completed', 'SERVER', `Course terminée - Encaissement ${finalAmount} MAD & sync Firestore`, {
      ride_id: currentRide.id,
      final_price: finalAmount,
      commission_15pct: commission,
      driver_net: finalAmount - commission,
    });
  };

  // Reset simulator
  const handleResetScenario = () => {
    setCurrentRide(null);
    setDriverOffers([]);
    setChatMessages([]);
    emitWsLog('simulator:reset', 'SERVER', `Scénario réinitialisé à l'état initial`, {});
  };

  // Role Switch Guard (Deliverable 4 in practice)
  const handleToggleRole = () => {
    if (activeRole === 'PASSENGER') {
      if (kycStatus === 'APPROVED') {
        onRoleChange('DRIVER');
      } else {
        setIsKycModalOpen(true);
      }
    } else {
      onRoleChange('PASSENGER');
    }
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 7),
      senderRole: activeRole,
      senderName: activeRole === 'PASSENGER' ? INITIAL_USER.fullName : INITIAL_DRIVER_USER.fullName,
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    if (currentRide) {
      saveMessageToFirestore(currentRide.id, newMsg);
    }

    emitWsLog('chat:message:sent', activeRole, `Message in-app envoyé & enregistré dans Firestore`, {
      text,
      sender: activeRole,
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Banner & Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
            <span>Simulateur Interactif Live · Single Binary App</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              WebSockets Synchronisés
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Firebase Firestore Sync</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Testez la négociation en temps réel entre le passager et le conducteur avec persistance instantanée dans la base Firebase Firestore.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Display Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setLayoutMode('SPLIT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'SPLIT'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Vue Double (Côte à côte)</span>
            </button>
            <button
              onClick={() => setLayoutMode('SINGLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'SINGLE'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vue Unique (Switch Rôle)</span>
            </button>
          </div>

          {/* Passenger Points Wallet Button */}
          <button
            onClick={() => setIsPassengerWalletOpen(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 font-mono"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Points : {passengerUser.pointsBalance} DH</span>
          </button>

          {/* Driver Bank RIB Button */}
          <button
            onClick={() => setIsDriverRibOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5 text-sky-400" />
            <span>RIB Conducteur</span>
          </button>

          {/* KYC Status Button */}
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>KYC : {kycStatus}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetScenario}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
            title="Réinitialiser la course"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Switcher Banner (Deliverable 4 interactive demo) */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/40 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Composant de Basculement (Role Switcher Guard)</span>
              <span className="text-[10px] text-slate-400 font-mono">Deliverable 4</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rôle actif actuel : <strong className="text-white">{activeRole === 'PASSENGER' ? 'Passager' : 'Conducteur'}</strong> · KYC Chauffeur : <strong className={kycStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}>{kycStatus}</strong>
            </p>
          </div>
        </div>

        {/* Dynamic Switch Button matching Flutter logic */}
        <button
          onClick={handleToggleRole}
          className={`py-2 px-4 rounded-full font-semibold text-xs transition-all shadow-md flex items-center gap-2 ${
            activeRole === 'DRIVER'
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <span>{activeRole === 'DRIVER' ? 'Mode Conducteur Actif' : 'Mode Passager Actif'}</span>
          <div className="p-1 rounded-full bg-white/20">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* PHONE SCREENS CONTAINER */}
      {layoutMode === 'SPLIT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PHONE 1: PASSAGER */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Terminal Passager (Client)
                </span>
                <span className="font-mono text-amber-400">{passengerUser.pointsBalance} Points</span>
              </div>

              {/* Smartphone Frame */}
              <div className="w-full h-[680px] bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl p-2 relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
                {/* Phone speaker notch */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-1 shrink-0 flex items-center justify-center">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="flex-1 rounded-[30px] overflow-hidden flex flex-col bg-slate-950 border border-slate-900">
                  <PassengerApp
                    currentRide={currentRide}
                    driverOffers={driverOffers}
                    pointsBalance={passengerUser.pointsBalance}
                    isPassJeunes={passengerUser.isPassJeunes}
                    onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
                    onPublishRide={handlePublishRide}
                    onAcceptOffer={handleAcceptOffer}
                    onCancelRide={handleResetScenario}
                    onOpenChat={() => setIsChatOpen(true)}
                    onOpenSos={() => setIsSosOpen(true)}
                    onOpenWallet={() => setIsPassengerWalletOpen(true)}
                    onConfirmPassengerCompletion={handleConfirmPassengerCompletion}
                    chatMessages={chatMessages}
                    unreadChatCount={unreadChatCount}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PHONE 2: CONDUCTEUR */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Terminal Conducteur (Chauffeur)
                </span>
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[130px]">
                  {driverProfile.bankName?.split(' ')[0] || 'Attijariwafa'}
                </span>
              </div>

              {/* Smartphone Frame */}
              <div className="w-full h-[680px] bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl p-2 relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
                {/* Phone speaker notch */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-1 shrink-0 flex items-center justify-center">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="flex-1 rounded-[30px] overflow-hidden flex flex-col bg-slate-950 border border-slate-900">
                  <DriverApp
                    currentRide={currentRide}
                    driverProfile={driverProfile}
                    transactions={transactions}
                    onAcceptClientPrice={handleAcceptClientPrice}
                    onSubmitCounterOffer={handleSubmitCounterOffer}
                    onIgnoreRide={handleIgnoreRide}
                    onSignalArrival={handleSignalArrival}
                    onValidateOtpAndStartTrip={handleValidateOtpAndStartTrip}
                    onCompleteTrip={handleCompleteTrip}
                    onOpenChat={() => setIsChatOpen(true)}
                    onOpenRibModal={() => setIsDriverRibOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SINGLE PHONE VIEW (REAL SINGLE BINARY APP TOGGLE) */
        <div className="flex flex-col items-center py-2">
          <div className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Application Unique ({activeRole === 'PASSENGER' ? 'Client' : 'Chauffeur'})</span>
              </span>
              <button
                onClick={handleToggleRole}
                className="text-amber-400 hover:text-amber-300 font-medium underline"
              >
                Changer de rôle
              </button>
            </div>

            {/* Smartphone Frame */}
            <div className="w-full h-[700px] bg-slate-950 rounded-[44px] border-4 border-slate-800 shadow-2xl p-2 relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
              <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-1 shrink-0 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>

              <div className="flex-1 rounded-[32px] overflow-hidden flex flex-col bg-slate-950 border border-slate-900">
                {activeRole === 'PASSENGER' ? (
                  <PassengerApp
                    currentRide={currentRide}
                    driverOffers={driverOffers}
                    pointsBalance={passengerUser.pointsBalance}
                    isPassJeunes={passengerUser.isPassJeunes}
                    onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
                    onPublishRide={handlePublishRide}
                    onAcceptOffer={handleAcceptOffer}
                    onCancelRide={handleResetScenario}
                    onOpenChat={() => setIsChatOpen(true)}
                    onOpenSos={() => setIsSosOpen(true)}
                    onOpenWallet={() => setIsPassengerWalletOpen(true)}
                    onConfirmPassengerCompletion={handleConfirmPassengerCompletion}
                    chatMessages={chatMessages}
                    unreadChatCount={unreadChatCount}
                  />
                ) : (
                  <DriverApp
                    currentRide={currentRide}
                    driverProfile={driverProfile}
                    transactions={transactions}
                    onAcceptClientPrice={handleAcceptClientPrice}
                    onSubmitCounterOffer={handleSubmitCounterOffer}
                    onIgnoreRide={handleIgnoreRide}
                    onSignalArrival={handleSignalArrival}
                    onValidateOtpAndStartTrip={handleValidateOtpAndStartTrip}
                    onCompleteTrip={handleCompleteTrip}
                    onOpenChat={() => setIsChatOpen(true)}
                    onOpenRibModal={() => setIsDriverRibOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <PassengerWalletModal
        isOpen={isPassengerWalletOpen}
        onClose={() => setIsPassengerWalletOpen(false)}
        pointsBalance={passengerUser.pointsBalance}
        onRechargePoints={handleRechargePoints}
      />

      <SubscriptionsModal
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
        currentUser={passengerUser}
        onSubscriptionActivated={(plan) => {
          setPassengerUser((prev) => ({
            ...prev,
            isPassJeunes: plan.id === 'sub_jeunes',
            subscription: {
              planId: plan.id,
              planName: plan.title,
              status: 'ACTIVE',
              expiresAt: '30 Nov 2026',
              discountPct: Math.round(plan.discountRate * 100),
              autoRenew: true,
            },
          }));
        }}
      />

      <DriverRibModal
        isOpen={isDriverRibOpen}
        onClose={() => setIsDriverRibOpen(false)}
        currentBalance={transactions.length > 0 ? transactions[0].balanceAfter : 477.25}
        currentRib={driverProfile.bankRib}
        currentBankName={driverProfile.bankName}
        currentAccountHolder={driverProfile.bankAccountHolder}
        onSaveRib={handleSaveRib}
        onRequestPayout={handleRequestPayout}
      />

      {/* MODALS */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        currentKycStatus={kycStatus}
        onUpdateKycStatus={(status, vehicle, driverInfo) => {
          onKycStatusChange(status);
          if (driverInfo) {
            const updated = {
              ...driverProfile,
              driverPhotoUrl: driverInfo.driverPhotoUrl,
              cinNumber: driverInfo.cinNumber,
              cinRectoUrl: driverInfo.cinRectoUrl,
              cinVersoUrl: driverInfo.cinVersoUrl,
              kycStatus: status,
            };
            setDriverProfile(updated);
            syncUserToFirestore(updated);
            saveKycSubmission({
              userId: driverProfile.id,
              fullName: driverProfile.fullName,
              cinNumber: driverInfo.cinNumber,
              cinRectoUrl: driverInfo.cinRectoUrl,
              cinVersoUrl: driverInfo.cinVersoUrl,
              driverPhotoUrl: driverInfo.driverPhotoUrl,
              vehicleMake: vehicle?.make || 'Toyota',
              vehicleModel: vehicle?.model || 'Corolla',
              vehiclePlate: vehicle?.licensePlate || '12-A-89452',
              status,
            });
          }
          if (status === 'APPROVED') {
            onRoleChange('DRIVER');
          }
        }}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentRole={activeRole}
        counterpartName={activeRole === 'PASSENGER' ? 'Omar Tazi (Chauffeur)' : 'Karim Bennani (Passager)'}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        rideId={currentRide?.id || 'RIDE_MOCK_101'}
        driverName={currentRide?.driver?.name}
        vehiclePlate={currentRide?.driver?.vehicle.licensePlate}
      />
    </div>
  );
};
