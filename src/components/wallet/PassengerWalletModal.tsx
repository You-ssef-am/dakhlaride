import React, { useState } from 'react';
import { Coins, CreditCard, PlusCircle, CheckCircle2, ArrowRight, ShieldCheck, X, Sparkles, History, Smartphone } from 'lucide-react';

interface PassengerWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsBalance: number;
  onRechargePoints: (pointsToAdd: number, amountPaidMAD: number) => void;
}

export const PassengerWalletModal: React.FC<PassengerWalletModalProps> = ({
  isOpen,
  onClose,
  pointsBalance,
  onRechargePoints,
}) => {
  const [selectedPack, setSelectedPack] = useState<number>(100);
  const [paymentOption, setPaymentOption] = useState<'CARD' | 'CMI'>('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9210');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const packs = [
    { points: 50, price: 50, label: 'Découverte', bonus: 0 },
    { points: 100, price: 100, label: 'Standard', bonus: 0 },
    { points: 200, price: 200, label: 'Populaire', bonus: 10 },
    { points: 500, price: 500, label: 'Maxi Dakhla', bonus: 35 },
  ];

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessNotice(null);

    const pack = packs.find((p) => p.points === selectedPack) || packs[1];
    const totalPoints = pack.points + pack.bonus;

    setTimeout(() => {
      setIsProcessing(false);
      onRechargePoints(totalPoints, pack.price);
      setSuccessNotice(`+${totalPoints} Points crédités avec succès sur votre compte !`);
      setTimeout(() => {
        setSuccessNotice(null);
      }, 3500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Solde & Recharges en Points</h3>
            <p className="text-xs text-slate-400">
              1 Point = 1 Dirham marocain (1 MAD) · Paiement instantané des courses
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Current Balance Hero Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-950 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
              Mon Solde de Points
            </span>
            <div className="text-3xl font-black text-white font-mono tracking-tight mt-1 flex items-baseline gap-2">
              <span>{pointsBalance}</span>
              <span className="text-sm font-semibold text-amber-400">Points</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Équivalent à <strong className="text-white font-mono">{pointsBalance} MAD</strong> pour régler vos trajets
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              Actif & Sécurisé
            </span>
          </div>
        </div>

        {/* Point Packs Selection */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              1. Choisir un pack de recharge
            </span>
            <span className="text-[10px] text-slate-500">Paiement CMI sécurisé</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {packs.map((pack) => {
              const isSelected = selectedPack === pack.points;
              return (
                <button
                  key={pack.points}
                  type="button"
                  onClick={() => setSelectedPack(pack.points)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {pack.bonus > 0 && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md shadow-sm">
                      +{pack.bonus} PTS OFFERTS
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-base font-bold text-white">
                      {pack.points + pack.bonus} <span className="text-xs text-amber-400">Pts</span>
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {pack.price} DH
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{pack.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method form */}
        <form onSubmit={handleBuy} className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              2. Moyen de paiement
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Certifié CMI / 3D Secure
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentOption('CARD')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                paymentOption === 'CARD'
                  ? 'bg-slate-800 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Carte CMI / Visa</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentOption('CMI')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                paymentOption === 'CMI'
                  ? 'bg-slate-800 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Paiement Mobile</span>
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Numéro de carte de paiement</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Montant débité :</span>
              <span className="font-mono font-bold text-white">
                {packs.find((p) => p.points === selectedPack)?.price || 100} MAD
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Validation sécurisée CMI...</span>
              </span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>
                  Recharger {selectedPack} Points ({selectedPack} DH)
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Les points n'expirent jamais et sont utilisables instantanément sur tous vos trajets à Dakhla.
          </p>
        </div>
      </div>
    </div>
  );
};
