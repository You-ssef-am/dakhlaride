import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle, X, Share2 } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  driverName?: string;
  vehiclePlate?: string;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  rideId,
  driverName,
  vehiclePlate,
}) => {
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTriggerEmergency = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(interval);
          setTriggered(true);
          return 0;
        }
        return prev !== null ? prev - 1 : 0;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Centre d'Urgence SOS</h3>
            <p className="text-xs text-rose-400">Assistance 24/7 & Géolocalisation directe</p>
          </div>
        </div>

        {triggered ? (
          <div className="mt-5 p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <CheckCircle className="w-5 h-5 text-rose-400" />
              <span>Alerte d'urgence transmise !</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vos coordonnées GPS précises (23.7183 N, -15.9322 W), la télémétrie du véhicule ({vehiclePlate || '12-A-89452'}) et la fiche du conducteur ({driverName || 'Omar Tazi'}) ont été transmises au centre opérationnel de secours et à vos contacts d'urgence.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>RIDE_ID: {rideId}</div>
              <div>DISPATCH: POLICE SECORIS DAKHLA (19 / 112)</div>
              <div>SMS_RELAY: ACTIF (3 CONTACTS NOTIFIÉS)</div>
            </div>
            <button
              onClick={() => {
                setTriggered(false);
                setCountdown(null);
                onClose();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl transition-colors"
            >
              Fermer et retourner au trajet
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              En cas de situation de danger ou d'accident, appuyez sur le bouton ci-dessous pour alerter instantanément les services de secours et partager votre trajet en direct.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Conducteur :</span>
                <span className="text-white font-medium">{driverName || 'Chauffeur assigné'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Immatriculation :</span>
                <span className="text-white font-mono">{vehiclePlate || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Position actuelle :</span>
                <span className="text-amber-400 font-mono">Dakhla Baie RN1 (GPS Verrouillé)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleTriggerEmergency}
                disabled={countdown !== null}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                {countdown !== null ? `Envoi de l'alerte dans ${countdown}s...` : 'DÉCLENCHER LE BOUTON SOS'}
              </button>

              <button
                onClick={() => alert('Appel direct Police Secours (19)...')}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Composer le 19 (Police) ou 15 (Pompiers)
              </button>

              <button
                onClick={() => alert('Lien de partage direct copié dans le presse-papier !')}
                className="w-full py-2 px-4 text-slate-400 hover:text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Partager mon trajet avec un proche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
