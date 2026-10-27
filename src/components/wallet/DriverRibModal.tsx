import React, { useState } from 'react';
import { Landmark, ArrowUpRight, CheckCircle2, ShieldCheck, X, AlertCircle, Building, User, Wallet } from 'lucide-react';

interface DriverRibModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currentRib?: string;
  currentBankName?: string;
  currentAccountHolder?: string;
  onSaveRib: (rib: string, bankName: string, accountHolder: string) => void;
  onRequestPayout: (amount: number, rib: string, bankName: string) => void;
}

export const DriverRibModal: React.FC<DriverRibModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  currentRib = '230 780 4561234567890123 45',
  currentBankName = 'Attijariwafa Bank',
  currentAccountHolder = 'Yassine El Amrani',
  onSaveRib,
  onRequestPayout,
}) => {
  const [rib, setRib] = useState(currentRib);
  const [bankName, setBankName] = useState(currentBankName);
  const [accountHolder, setAccountHolder] = useState(currentAccountHolder);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.floor(currentBalance));
  const [activeTab, setActiveTab] = useState<'PAYOUT' | 'CONFIG_RIB'>('PAYOUT');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const moroccanBanks = [
    'Attijariwafa Bank',
    'Banque Populaire (BAM)',
    'CIH Bank',
    'Bank of Africa (BMCE Group)',
    'Société Générale Maroc',
    'Crédit du Maroc (CDM)',
    'Al Barid Bank',
    'CFG Bank',
  ];

  const handleSaveRib = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRib(rib.trim(), bankName, accountHolder.trim());
    setSuccessMessage('Coordonnées bancaires (RIB) enregistrées avec succès !');
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab('PAYOUT');
    }, 1500);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > currentBalance) {
      alert('Montant invalide ou solde insuffisant.');
      return;
    }

    setIsProcessing(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      onRequestPayout(withdrawAmount, rib, bankName);
      setSuccessMessage(
        `Virement interbancaire de ${withdrawAmount.toFixed(2)} MAD initié avec succès vers votre RIB (${bankName}) !`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    }, 1000);
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
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Retrait Bancaire & RIB Conducteur</h3>
            <p className="text-xs text-slate-400">
              Virement de vos gains directement sur votre compte bancaire marocain
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('PAYOUT')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PAYOUT'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Demander un Virement</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONFIG_RIB')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CONFIG_RIB'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Mon RIB (24 Chiffres)</span>
          </button>
        </div>

        {/* Success alert */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: DEMANDE DE VIREMENT VERS LE RIB */}
        {activeTab === 'PAYOUT' && (
          <form onSubmit={handlePayoutSubmit} className="mt-4 space-y-4">
            {/* Balance Overview */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Solde Disponible au Retrait</span>
                <div className="text-2xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                  {currentBalance.toFixed(2)} <span className="text-xs text-slate-300">MAD</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Délai estimé</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">24h ouvrées</span>
              </div>
            </div>

            {/* Configured RIB summary card */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Compte de Réception (RIB)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('CONFIG_RIB')}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Modifier le RIB
                </button>
              </div>
              <p className="font-bold text-white text-xs">{accountHolder}</p>
              <p className="text-[11px] text-slate-300">{bankName}</p>
              <div className="p-2 bg-slate-900 rounded-lg font-mono text-[11px] text-amber-300 font-bold border border-slate-800">
                {rib}
              </div>
            </div>

            {/* Withdraw Amount Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 block font-medium">
                Montant du virement bancaire (MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max={Math.floor(currentBalance)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(Math.floor(currentBalance))}
                  className="absolute right-2 top-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 rounded-md font-semibold"
                >
                  Tout virer
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Montant minimum de virement : 20 MAD</p>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isProcessing || currentBalance < 20}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Ordre de virement en cours...</span>
                </span>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirmer le Virement de {withdrawAmount} MAD</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: CONFIGURATION DU RIB BANCAIRE (24 CHIFFRES) */}
        {activeTab === 'CONFIG_RIB' && (
          <form onSubmit={handleSaveRib} className="mt-4 space-y-3.5">
            <p className="text-xs text-slate-400 leading-relaxed">
              Renseignez votre Relevé d'Identité Bancaire (RIB) à 24 chiffres délivré par votre banque au Maroc pour percevoir vos gains sans intermédiaire.
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nom de la Banque</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {moroccanBanks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nom et Prénom du Titulaire</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Ex: Yassine El Amrani"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Numéro RIB (24 Chiffres normalisés)
              </label>
              <input
                type="text"
                value={rib}
                onChange={(e) => setRib(e.target.value)}
                placeholder="230 780 4561234567890123 45"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 tracking-wider focus:outline-none focus:border-amber-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Format standard Bank Al-Maghrib : Code Banque (3) + Code Ville (3) + N° Compte (16) + Clé (2)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer mes coordonnées bancaires</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sécurisation interbancaire SIMT / Bank Al-Maghrib</span>
          </div>
          <span>Dakhla, Maroc</span>
        </div>
      </div>
    </div>
  );
};
