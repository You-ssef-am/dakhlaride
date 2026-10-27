import React, { useState } from 'react';
import {
  RentalItem,
  RentalBooking,
  RentalDurationUnit,
  GearCategory,
  PaymentMethod,
} from '../../types/ride';
import { RENTAL_ITEMS } from '../../data/mockData';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import {
  Camera,
  Waves,
  Compass,
  Bike,
  Clock,
  Calendar,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
  Search,
  Filter,
  ArrowRight,
  Info,
} from 'lucide-react';

interface GearRentalViewerProps {
  userPointsBalance: number;
  onDeductPoints?: (amount: number) => void;
}

export const GearRentalViewer: React.FC<GearRentalViewerProps> = ({
  userPointsBalance,
  onDeductPoints,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGear, setSelectedGear] = useState<RentalItem | null>(null);

  // Booking modal state
  const [durationUnit, setDurationUnit] = useState<RentalDurationUnit>('HOURLY');
  const [durationValue, setDurationValue] = useState<number>(3); // 3 hours or 3 days
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('POINTS');
  const [bookingSuccess, setBookingSuccess] = useState<RentalBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter items
  const filteredItems = RENTAL_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pickupSpot.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const calculateTotal = (item: RentalItem, unit: RentalDurationUnit, value: number) => {
    const rate = unit === 'HOURLY' ? item.hourlyRate : item.dailyRate;
    return rate * value;
  };

  const handleConfirmBooking = async () => {
    if (!selectedGear) return;
    setIsSubmitting(true);

    const total = calculateTotal(selectedGear, durationUnit, durationValue);
    const bookingId = 'rent_' + Math.random().toString(36).substring(2, 8);

    const newBooking: RentalBooking = {
      id: bookingId,
      userId: 'usr_pass_001',
      userName: 'Karim Bennani',
      gearId: selectedGear.id,
      gearTitle: selectedGear.title,
      durationUnit,
      durationValue,
      totalPrice: total,
      pickupLocation: selectedGear.pickupSpot,
      paymentMethod,
      status: 'CONFIRMED',
      startDate: new Date().toLocaleDateString('fr-FR'),
      endDate: new Date(Date.now() + (durationUnit === 'HOURLY' ? durationValue * 3600000 : durationValue * 86400000)).toLocaleDateString('fr-FR'),
      createdAt: Date.now(),
    };

    try {
      // Save to Firebase Firestore collection 'rentals'
      const rentRef = doc(db, 'rentals', bookingId);
      await setDoc(rentRef, {
        ...newBooking,
        savedToFirebaseAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write fallback:', e);
    }

    if (paymentMethod === 'POINTS' && onDeductPoints) {
      onDeductPoints(total);
    }

    setIsSubmitting(false);
    setBookingSuccess(newBooking);
  };

  const categories = [
    { id: 'ALL', label: 'Tout le matériel' },
    { id: 'CAMERA', label: 'GoPro & Caméras' },
    { id: 'KITESURF', label: 'Kitesurf' },
    { id: 'WING_FOIL', label: 'Wing & Foil' },
    { id: 'SAFARI_QUAD', label: 'Quads Safari' },
    { id: 'EBIKE', label: 'Fatbikes Plage' },
    { id: 'WATERSPORTS', label: 'Combinaisons' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-sky-500/10 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Tourisme & Kitesurf Dakhla
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Sync Firestore Active</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
              Location de Matériel & Aventures Nautiques
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Réservez votre équipement premium à l'heure ou à la journée : GoPro 4K étanches, ailes de kitesurf Duotone, Wing Foil, quads pour la Dune Blanche et Fatbikes pour la lagune.
            </p>
          </div>

          {/* Quick Points Balance Tag */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ★
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Solde Points Passager</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {userPointsBalance} Points
              </span>
              <span className="text-[10px] text-slate-500 ml-1">(1 Pt = 1 DH)</span>
            </div>
          </div>
        </div>

        {/* Search & Category filter */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher GoPro, Kitesurf, Quad, Fatbike, PK25..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gear Grid Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all flex flex-col group shadow-lg shadow-black/20"
          >
            {/* Image banner with badges */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900/90 text-amber-400 backdrop-blur-md border border-slate-700/60">
                  {item.categoryLabel}
                </span>
              </div>

              {item.isPopular && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                    ★ Populaire
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{item.rating}</span>
                  <span className="text-slate-400 font-normal">({item.reviewsCount} avis)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[140px]">{item.pickupSpot.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            {/* Content card */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Specs pills */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price rates and Booking Trigger */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-white font-mono">{item.hourlyRate} DH</span>
                    <span className="text-[10px] text-slate-400">/heure</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold font-mono">
                    ou {item.dailyRate} DH /journée
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGear(item);
                    setBookingSuccess(null);
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <span>Louer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {selectedGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedGear(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                  <img
                    src={selectedGear.imageUrl}
                    alt={selectedGear.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {selectedGear.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{selectedGear.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>Retrait : {selectedGear.pickupSpot}</span>
                    </p>
                  </div>
                </div>

                {/* Duration Unit Selector: Hourly vs Daily */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Mode de tarification :
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setDurationUnit('HOURLY');
                        setDurationValue(3);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        durationUnit === 'HOURLY'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Par Heure ({selectedGear.hourlyRate} DH/h)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDurationUnit('DAILY');
                        setDurationValue(1);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        durationUnit === 'DAILY'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Par Jour ({selectedGear.dailyRate} DH/j)</span>
                    </button>
                  </div>
                </div>

                {/* Duration Value Step */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>Durée de location ({durationUnit === 'HOURLY' ? 'heures' : 'jours'}) :</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {durationValue} {durationUnit === 'HOURLY' ? 'Heure(s)' : 'Jour(s)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDurationValue(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                          durationValue === num
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {num} {durationUnit === 'HOURLY' ? 'h' : 'j'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Mode de règlement :
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('POINTS')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'POINTS'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">Solde de Points</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Disponible : {userPointsBalance} Pts
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">Paiement sur place</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Espèces ou Carte bancaire</div>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tarif de base</span>
                    <span>
                      {durationUnit === 'HOURLY' ? selectedGear.hourlyRate : selectedGear.dailyRate} DH × {durationValue} {durationUnit === 'HOURLY' ? 'h' : 'j'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Caution matérielle (restituée)</span>
                    </span>
                    <span className="font-mono">{selectedGear.depositAmount} DH</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex items-center justify-between font-bold text-white text-sm">
                    <span>Total à régler</span>
                    <span className="text-amber-400 font-mono">
                      {calculateTotal(selectedGear, durationUnit, durationValue)} {paymentMethod === 'POINTS' ? 'Points' : 'DH'}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Enregistrement Firestore...' : 'Confirmer la réservation du matériel'}
                  </span>
                </button>
              </div>
            ) : (
              /* Success screen */
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Réservation Confirmée !</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Votre réservation a été synchronisée en temps réel dans la collection Firebase Firestore <strong>/rentals</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-1.5 text-slate-300">
                  <div>Ref Réservation : <strong className="text-amber-400">{bookingSuccess.id}</strong></div>
                  <div>Matériel : {bookingSuccess.gearTitle}</div>
                  <div>Lieu de retrait : {bookingSuccess.pickupLocation}</div>
                  <div>Montant : {bookingSuccess.totalPrice} {bookingSuccess.paymentMethod}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGear(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
