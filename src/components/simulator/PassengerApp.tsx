import React, { useState, useEffect } from 'react';
import {
  LocationPoint,
  RideRequest,
  DriverOffer,
  ChatMessage,
  RideStatus,
  VehicleType,
  TripType,
} from '../../types/ride';
import { DAKHLA_LOCATIONS, calculateMultimodalFare } from '../../data/mockData';
import { InteractiveMap } from './InteractiveMap';
import {
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  Shield,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Car,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Phone,
  RefreshCw,
  X,
  Bus,
  Bike,
  Truck,
  Users,
  GraduationCap,
  Zap,
} from 'lucide-react';

interface PassengerAppProps {
  currentRide: RideRequest | null;
  driverOffers: DriverOffer[];
  pointsBalance: number;
  isPassJeunes?: boolean;
  onPublishRide: (req: {
    origin: LocationPoint;
    destination: LocationPoint;
    proposedPrice: number;
    recommendedPrice: number;
    distanceKm: number;
    durationMinutes: number;
    paymentMethod: 'POINTS' | 'CASH';
    vehicleType: VehicleType;
    tripType: TripType;
    seatsBooked?: number;
  }) => void;
  onAcceptOffer: (offerId: string) => void;
  onCancelRide: () => void;
  onOpenChat: () => void;
  onOpenSos: () => void;
  onOpenWallet: () => void;
  onOpenSubscriptions?: () => void;
  onConfirmPassengerCompletion: (rating: number) => void;
  chatMessages: ChatMessage[];
  unreadChatCount?: number;
}

export const PassengerApp: React.FC<PassengerAppProps> = ({
  currentRide,
  driverOffers,
  pointsBalance,
  isPassJeunes = true,
  onPublishRide,
  onAcceptOffer,
  onCancelRide,
  onOpenChat,
  onOpenSos,
  onOpenWallet,
  onOpenSubscriptions,
  onConfirmPassengerCompletion,
  chatMessages,
  unreadChatCount = 0,
}) => {
  // Booking state when idle
  const [origin, setOrigin] = useState<LocationPoint>(DAKHLA_LOCATIONS[0]); // Aéroport
  const [destination, setDestination] = useState<LocationPoint>(DAKHLA_LOCATIONS[1]); // Centre-ville
  const [paymentMethod, setPaymentMethod] = useState<'POINTS' | 'CASH'>('POINTS');
  const [ratingInput, setRatingInput] = useState<number>(5);

  // Multimodal Transport Selection
  const [vehicleType, setVehicleType] = useState<VehicleType>('VOITURE');
  const [tripType, setTripType] = useState<TripType>('SOLO');
  const [seatsCount, setSeatsCount] = useState<number>(1);

  const distanceKm = 6.4;
  const durationMinutes = 12;

  // Compute recommended multimodal fare
  const baseRecommendedFare = calculateMultimodalFare(
    distanceKm,
    durationMinutes,
    vehicleType,
    tripType
  );
  // Pass Jeunes discount (if active: 50% discount on shared/bus or 25% on car)
  const discountMultiplier = isPassJeunes ? (tripType === 'SHARED' || vehicleType === 'BUS' ? 0.5 : 0.8) : 1;
  const recommendedFare = Math.max(10, Math.round((baseRecommendedFare * discountMultiplier) / 5) * 5);

  const [customPrice, setCustomPrice] = useState<number>(recommendedFare);

  // Recalculate custom price when mode changes
  useEffect(() => {
    setCustomPrice(recommendedFare);
  }, [vehicleType, tripType, origin, destination]);

  const handlePriceStep = (delta: number) => {
    setCustomPrice((prev) => Math.max(10, prev + delta));
  };

  const handleLaunchRequest = () => {
    onPublishRide({
      origin,
      destination,
      proposedPrice: customPrice,
      recommendedPrice: recommendedFare,
      distanceKm,
      durationMinutes,
      paymentMethod,
      vehicleType,
      tripType,
      seatsBooked: tripType === 'SHARED' ? seatsCount : 1,
    });
  };

  const status: RideStatus = currentRide ? currentRide.status : 'IDLE';

  const vehicleOptions: { type: VehicleType; label: string; desc: string; icon: any }[] = [
    { type: 'VOITURE', label: 'Voiture', desc: 'Confort 4 places', icon: Car },
    { type: 'BUS', label: 'Bus / Navette', desc: 'Éco Lagune PK25', icon: Bus },
    { type: 'MOTO', label: 'Moto Express', desc: 'Rapide 1 place', icon: Bike },
    { type: 'TRIPORTEUR', label: 'Triporteur', desc: 'Éco & Matériel', icon: Truck },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Mobile Bar with Points & Subscriptions Shortcut */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Espace Passager</span>
              <span className="text-[10px] font-normal text-slate-400">· Dakhla</span>
            </div>
            <div className="text-[10px] text-slate-400">Transport multimodal & libre négociation</div>
          </div>
        </div>

        {/* Right slot: Pass Jeunes badge & Points wallet */}
        <div className="flex items-center gap-1.5">
          {onOpenSubscriptions && (
            <button
              type="button"
              onClick={onOpenSubscriptions}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                isPassJeunes
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Gérer mon Pass Jeunes / Abonnement"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPassJeunes ? 'Pass -50%' : 'Pass'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenWallet}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-400 transition-colors"
            title="Ouvrir mon portefeuille de points"
          >
            <span>{pointsBalance} Pts</span>
            <span className="text-[10px] text-amber-300 font-sans font-bold bg-amber-500/20 px-1 rounded">+</span>
          </button>

          {status !== 'IDLE' && (
            <button
              onClick={onCancelRide}
              className="text-[11px] px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 rounded-lg transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Map Zone */}
      <div className="p-3 pb-2">
        <InteractiveMap
          origin={currentRide ? currentRide.origin : origin}
          destination={currentRide ? currentRide.destination : destination}
          status={status}
          vehicleType={currentRide ? currentRide.vehicleType : vehicleType}
          showOtherDrivers={true}
        />
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        {/* STATE 1: IDLE / FORMULAIRE DE RÉSERVATION */}
        {status === 'IDLE' && (
          <div className="space-y-3">
            {/* Origin & Destination pickers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              {/* Pickup point */}
              <div className="flex items-start gap-2.5">
                <div className="pt-1 text-sky-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Départ (Point de prise en charge)
                  </span>
                  <select
                    value={origin.id}
                    onChange={(e) => {
                      const found = DAKHLA_LOCATIONS.find((l) => l.id === e.target.value);
                      if (found) setOrigin(found);
                    }}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    {DAKHLA_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-px bg-slate-800 ml-5" />

              {/* Destination point */}
              <div className="flex items-start gap-2.5">
                <div className="pt-1 text-rose-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Destination
                  </span>
                  <select
                    value={destination.id}
                    onChange={(e) => {
                      const found = DAKHLA_LOCATIONS.find((l) => l.id === e.target.value);
                      if (found) setDestination(found);
                    }}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    {DAKHLA_LOCATIONS.filter((l) => l.id !== origin.id).map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* REQUIREMENT 1: MULTIMODAL VEHICLE SELECTION MODAL / TOGGLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Type de Transport & Véhicule
              </span>

              <div className="grid grid-cols-4 gap-1.5">
                {vehicleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = vehicleType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setVehicleType(opt.type)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px] leading-tight block">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* REQUIREMENT 1: TRIP TYPE: COURSE SEULE vs COURSE PARTAGÉE */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1.5">
                  Formule de Course
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTripType('SOLO')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      tripType === 'SOLO'
                        ? 'bg-slate-950 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Course Seule</span>
                      <span className="text-[10px] font-mono text-slate-400">Privée</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Véhicule réservé pour vous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTripType('SHARED')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                      tripType === 'SHARED'
                        ? 'bg-slate-950 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>Partagée (Pool)</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        -40%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Tarif réduit par passager</span>
                  </button>
                </div>

                {/* If shared: choose seats */}
                {tripType === 'SHARED' && (
                  <div className="mt-2 flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Nombre de places réservées :</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSeatsCount(num)}
                          className={`w-6 h-6 rounded-lg text-xs font-mono font-bold transition-colors ${
                            seatsCount === num
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pass Jeunes banner if applied */}
              {isPassJeunes && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Pass Jeunes Actif : -50% appliqué sur le tarif de base !</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-400">Éco</span>
                </div>
              )}
            </div>

            {/* Custom Bidding Price Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-white">Votre proposition de tarif</span>
                  <p className="text-[10px] text-slate-400">
                    Tarif conseillé : <span className="font-mono text-amber-400 font-bold">{recommendedFare} MAD</span>
                  </p>
                </div>
                <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-medium">
                  Libre & Négociable
                </div>
              </div>

              {/* Price selector with stepper */}
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-2">
                <button
                  type="button"
                  onClick={() => handlePriceStep(-5)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
                >
                  -
                </button>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                    {customPrice} <span className="text-sm font-semibold text-slate-400">MAD</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ~{(customPrice / 11).toFixed(1)} €
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePriceStep(5)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Price presets */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCustomPrice(Math.max(10, recommendedFare - 5))}
                  className={`py-1 text-[11px] rounded-lg border transition-all ${
                    customPrice === Math.max(10, recommendedFare - 5)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Éco {Math.max(10, recommendedFare - 5)} DH
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrice(recommendedFare)}
                  className={`py-1 text-[11px] rounded-lg border transition-all ${
                    customPrice === recommendedFare
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Juste {recommendedFare} DH
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrice(recommendedFare + 10)}
                  className={`py-1 text-[11px] rounded-lg border transition-all ${
                    customPrice === recommendedFare + 10
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Prioritaire {recommendedFare + 10} DH
                </button>
              </div>

              {/* Payment Method Selector: Points vs Cash */}
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Mode de Règlement
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">
                    1 Point = 1 DH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('POINTS')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentMethod === 'POINTS'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">Points Dakhla</span>
                      <span className="text-[10px] font-mono font-semibold">Solde: {pointsBalance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Paiement instantané in-app</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Espèces (Cash)</span>
                      <span className="text-[10px] text-slate-400">À bord</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Paiement direct chauffeur</p>
                  </button>
                </div>

                {paymentMethod === 'POINTS' && pointsBalance < customPrice && (
                  <div className="mt-2 p-2 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center justify-between text-[11px] text-rose-300">
                    <span>Solde insuffisant ({pointsBalance} Pts disponibles)</span>
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px]"
                    >
                      Recharger +
                    </button>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleLaunchRequest}
                className="w-full mt-3 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Lancer la recherche ({customPrice} MAD · {vehicleType} · {tripType === 'SHARED' ? 'Partagée' : 'Solo'})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: SEARCHING / ATTENTE ET RÉCEPTION DES OFFRES EN TEMPS RÉEL */}
        {(status === 'SEARCHING' || status === 'OFFERS_RECEIVED') && (
          <div className="space-y-3">
            {/* Header info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>En attente des contre-offres chauffeurs...</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Votre offre : <span className="font-mono text-amber-400 font-bold">{currentRide?.passengerPrice} MAD</span> ({currentRide?.vehicleType} · {currentRide?.tripType})
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                {driverOffers.length} offre{driverOffers.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* List of driver offers side-by-side or stacked */}
            {driverOffers.length === 0 ? (
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Car className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-xs font-semibold text-white">Diffusion en cours aux chauffeurs</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Le système interroge les chauffeurs connectés dans la zone Dakhla via WebSockets et Firestore.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Offres reçues en direct :
                </span>
                {driverOffers.map((offer) => {
                  const isCounter = offer.offeredPrice > (currentRide?.passengerPrice || 0);
                  return (
                    <div
                      key={offer.id}
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all space-y-2.5 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={offer.driverAvatar}
                            alt={offer.driverName}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{offer.driverName}</span>
                              <div className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{offer.driverRating}</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Car className="w-3 h-3 text-slate-500" />
                              <span>
                                {offer.vehicle.make} {offer.vehicle.model} · {offer.vehicle.licensePlate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] mt-0.5">
                              <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                                <Shield className="w-2.5 h-2.5" />
                                <span>CIN Vérifiée</span>
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono">
                                {offer.vehicle.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price badge */}
                        <div className="text-right">
                          <div className="text-base font-extrabold text-amber-400 font-mono">
                            {offer.offeredPrice} <span className="text-xs">MAD</span>
                          </div>
                          {isCounter && (
                            <span className="text-[10px] text-orange-400 font-medium">
                              +{offer.offeredPrice - (currentRide?.passengerPrice || 0)} DH
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Driver ETA & Acceptance button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1 text-[11px] text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>Arrivée estimée dans <strong>{offer.etaMinutes} min</strong></span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onAcceptOffer(offer.id)}
                          className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accepter ({offer.offeredPrice} DH)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STATE 3: ACCEPTED / ARRIVED / IN_PROGRESS / SUIVI SÉCURISÉ DU TRAJET */}
        {(status === 'ACCEPTED' || status === 'ARRIVED' || status === 'IN_PROGRESS' || status === 'COMPLETED') && (
          <div className="space-y-3">
            {/* OTP Security Code Card */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">
                  Code Sécurité Départ (OTP)
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  À donner verbalement au chauffeur à sa montée :
                </p>
              </div>
              <div className="px-3.5 py-1.5 bg-slate-950 border border-amber-500/60 rounded-xl text-xl font-mono font-black text-amber-400 tracking-widest shadow-inner">
                {currentRide?.otpCode || '4819'}
              </div>
            </div>

            {/* Matched Driver profile card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentRide?.driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                    alt="Photo Conducteur"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentRide?.driver?.name || 'Yassine El Amrani'}</span>
                      <span className="text-[11px] text-amber-400 font-semibold flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-0.5" />
                        {currentRide?.driver?.rating || 4.96}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {currentRide?.driver?.vehicle.make} {currentRide?.driver?.vehicle.model} ({currentRide?.vehicleType})
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="font-mono text-amber-400 font-bold">
                        {currentRide?.driver?.vehicle.licensePlate || '12-A-89452'}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">CIN Vérifiée</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 font-mono block">
                    {currentRide?.finalPrice || currentRide?.passengerPrice} MAD
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentRide?.paymentMethod === 'POINTS' ? 'En Points' : 'En Cash'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Chat & SOS */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 relative"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Discussion</span>
                  {unreadChatCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenSos}
                  className="py-2 px-3 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 rounded-xl text-xs font-semibold text-rose-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>SOS Urgence</span>
                </button>
              </div>
            </div>

            {/* Passenger Confirmation & Rating at Completion */}
            {status === 'COMPLETED' && !currentRide?.passengerConfirmedCompletion && (
              <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 space-y-3 animate-fadeIn">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Trajet Terminé avec Succès !</h4>
                  <p className="text-[11px] text-slate-400">
                    Veuillez évaluer votre chauffeur pour clôturer la transaction.
                  </p>
                </div>

                {/* Rating 5 stars */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingInput
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onConfirmPassengerCompletion(ratingInput)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la fin de course & Valider le paiement</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
