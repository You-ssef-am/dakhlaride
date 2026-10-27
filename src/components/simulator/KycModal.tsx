import React, { useState } from 'react';
import { KycStatus, Vehicle } from '../../types/ride';
import {
  ShieldCheck,
  FileCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Check,
  Car,
  X,
  Clock,
  Camera,
  CreditCard,
  User,
  Image as ImageIcon,
} from 'lucide-react';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKycStatus: KycStatus;
  onUpdateKycStatus: (
    status: KycStatus,
    vehicle?: Vehicle,
    driverInfo?: {
      driverPhotoUrl: string;
      cinNumber: string;
      cinRectoUrl: string;
      cinVersoUrl: string;
    }
  ) => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  onClose,
  currentKycStatus,
  onUpdateKycStatus,
}) => {
  // Vehicle state
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Corolla Hybrid');
  const [plate, setPlate] = useState('12-A-89452');
  const [year, setYear] = useState(2023);

  // Driver Photo state (NEW REQUIREMENT)
  const [driverPhoto, setDriverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  );

  // Carte Nationale d'Identité (CIN) state (NEW REQUIREMENT)
  const [cinNumber, setCinNumber] = useState('OD-89452');
  const [cinRecto, setCinRecto] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [cinVerso, setCinVerso] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [hasCinRecto, setHasCinRecto] = useState(true);
  const [hasCinVerso, setHasCinVerso] = useState(true);

  // Required documents
  const [hasLicense, setHasLicense] = useState(true);
  const [hasRegistration, setHasRegistration] = useState(true);
  const [hasInsurance, setHasInsurance] = useState(true);

  if (!isOpen) return null;

  const sampleDriverPhotos = [
    {
      label: 'Conducteur 1',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      label: 'Conducteur 2',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      label: 'Conductrice',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleSubmit = (targetStatus: KycStatus = 'PENDING') => {
    const vehicle: Vehicle = {
      id: 'veh_' + Math.random().toString(36).substring(2, 7),
      driverId: 'usr_drv_current',
      type: 'VOITURE',
      make,
      model,
      color: 'Gris Métal',
      licensePlate: plate,
      year,
      isActive: true,
      licenseDocUrl: 'https://docs.dakhla-ride.ma/permis_mock.pdf',
      registrationDocUrl: 'https://docs.dakhla-ride.ma/carte_grise_mock.pdf',
      insuranceDocUrl: 'https://docs.dakhla-ride.ma/assurance_mock.pdf',
      cinRectoUrl: cinRecto,
      cinVersoUrl: cinVerso,
    };

    onUpdateKycStatus(targetStatus, vehicle, {
      driverPhotoUrl: driverPhoto,
      cinNumber,
      cinRectoUrl: cinRecto,
      cinVersoUrl: cinVerso,
    });

    if (targetStatus === 'APPROVED') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dossier KYC Conducteur & Justificatifs</h3>
              <p className="text-xs text-slate-400">
                Photo d'identité, Carte Nationale (CIN), Permis & Véhicule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Statut de validation :</span>
          <div className="flex items-center gap-2">
            {currentKycStatus === 'APPROVED' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dossier Validé (Mode Chauffeur actif)
              </span>
            )}
            {currentKycStatus === 'PENDING' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800/40">
                <Clock className="w-3.5 h-3.5" /> En cours d'examen (24h)
              </span>
            )}
            {currentKycStatus === 'NOT_SUBMITTED' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/40">
                <AlertCircle className="w-3.5 h-3.5" /> Pièces non soumises
              </span>
            )}
            {currentKycStatus === 'REJECTED' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-800/40">
                <AlertCircle className="w-3.5 h-3.5" /> Rejeté (Pièces non conformes)
              </span>
            )}
          </div>
        </div>

        {/* SECTION 1: PHOTO DU CONDUCTEUR (NEW REQUIREMENT) */}
        <div className="mt-5 space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                1. Photo de Profil du Conducteur
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Requis pour le passager
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <div className="relative">
              <img
                src={driverPhoto}
                alt="Conducteur"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-lg text-slate-950">
                <Check className="w-3 h-3 font-bold" />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-slate-300">
                Photo nette du visage de face, sans lunettes de soleil, sur fond neutre.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-[10px] text-slate-500 mr-1">Choisir un profil :</span>
                {sampleDriverPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDriverPhoto(p.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      driverPhoto === p.url
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CARTE NATIONALE D'IDENTITÉ - CIN (NEW REQUIREMENT) */}
        <div className="mt-4 space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                2. Carte Nationale d'Identité (CIN / CNIE)
              </span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Dakhla · Région OD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Numéro CIN */}
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">
                Numéro de Carte Nationale (CIN)
              </label>
              <input
                type="text"
                value={cinNumber}
                onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                placeholder="Ex: OD-89452"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* CIN Photo Recto */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">CIN Recto (Face avant)</span>
                {hasCinRecto ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Validé
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">En attente</span>
                )}
              </div>
              <div className="relative h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img
                  src={cinRecto}
                  alt="CIN Recto"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-slate-200">Photo & Numéro CIN</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasCinRecto(!hasCinRecto)}
                className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>{hasCinRecto ? 'Remplacer photo' : 'Téléverser Recto'}</span>
              </button>
            </div>

            {/* CIN Photo Verso */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">CIN Verso (Face arrière)</span>
                {hasCinVerso ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Validé
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">En attente</span>
                )}
              </div>
              <div className="relative h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img
                  src={cinVerso}
                  alt="CIN Verso"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-slate-200">Adresse & Puce MRZ</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasCinVerso(!hasCinVerso)}
                className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>{hasCinVerso ? 'Remplacer photo' : 'Téléverser Verso'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: PERMIS, CARTE GRISE, ASSURANCE */}
        <div className="mt-4 space-y-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            3. Pièces Automobile Réglementaires
          </span>

          {/* Permis */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-white">Permis de conduire B</p>
                <p className="text-[11px] text-slate-400">Certificat en cours de validité</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHasLicense(!hasLicense)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                hasLicense
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {hasLicense ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
              {hasLicense ? 'Vérifié' : 'Téléverser'}
            </button>
          </div>

          {/* Carte Grise */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-white">Carte Grise du véhicule</p>
                <p className="text-[11px] text-slate-400">Immatriculation officielle</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHasRegistration(!hasRegistration)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                hasRegistration
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {hasRegistration ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
              {hasRegistration ? 'Vérifié' : 'Téléverser'}
            </button>
          </div>

          {/* Assurance */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-white">Attestation d'assurance VTC</p>
                <p className="text-[11px] text-slate-400">Couverture responsabilité civile passagers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHasInsurance(!hasInsurance)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                hasInsurance
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {hasInsurance ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
              {hasInsurance ? 'Vérifié' : 'Téléverser'}
            </button>
          </div>
        </div>

        {/* SECTION 4: VEHICLE INFO */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              4. Données du Véhicule
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Marque</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Modèle</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Immatriculation</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Année</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleSubmit('APPROVED')}
            className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Valider le dossier complet (Mode Chauffeur)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('PENDING')}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors"
          >
            Mettre en examen (24h)
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('NOT_SUBMITTED')}
            className="w-full sm:w-auto py-3 px-3 text-slate-400 hover:text-white text-xs transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};
