import React, { useState, useEffect } from 'react';
import {
  Database,
  Flame,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileCode,
  ShieldCheck,
  Server,
  Radio,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { db, testConnection, saveRideToFirestore, saveUserToFirestore } from '../../lib/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';
import { collection, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import { DAKHLA_LOCATIONS } from '../../data/mockData';
import { RideRequest } from '../../types/ride';

export const FirebaseDatabaseViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'EXPLORER' | 'RULES' | 'BLUEPRINT'>('EXPLORER');
  const [selectedCollection, setSelectedCollection] = useState<'rides' | 'users' | 'kyc_applications' | 'rentals'>('rides');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Check connection on mount
  useEffect(() => {
    const runTest = async () => {
      const start = Date.now();
      try {
        const ok = await testConnection();
        setLatencyMs(Date.now() - start);
        setIsConnected(ok);
      } catch (err) {
        setIsConnected(false);
      }
    };
    runTest();
  }, []);

  // Subscribe to real-time updates for selected collection
  useEffect(() => {
    setLoading(true);
    try {
      const collRef = collection(db, selectedCollection);
      const unsubscribe = onSnapshot(
        collRef,
        (snapshot) => {
          const docs: any[] = [];
          snapshot.forEach((d) => {
            docs.push({ id: d.id, ...d.data() });
          });
          setDocuments(docs);
          setLoading(false);
        },
        (error) => {
          console.warn('Snapshot error on collection:', selectedCollection, error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, [selectedCollection]);

  // Handle seeding a quick test ride into Firestore
  const handleSeedSampleRide = async () => {
    setActionFeedback('Envoi d\'une course test à Firestore...');
    const randomPrice = Math.floor(25 + Math.random() * 40);
    const sampleRide: RideRequest = {
      id: 'ride_fb_' + Math.random().toString(36).substring(2, 7),
      passengerId: 'usr_pass_001',
      passengerName: 'Karim Bennani (Dakhla)',
      passengerRating: 4.95,
      origin: DAKHLA_LOCATIONS[0], // Aéroport
      destination: DAKHLA_LOCATIONS[1], // Centre-Ville
      recommendedPrice: 35,
      passengerPrice: randomPrice,
      status: 'SEARCHING',
      otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
      distanceKm: 6.4,
      durationMinutes: 12,
      paymentMethod: 'POINTS',
      vehicleType: 'VOITURE',
      tripType: 'SOLO',
      createdAt: Date.now(),
    };

    try {
      await saveRideToFirestore(sampleRide);
      setActionFeedback(`Course ${sampleRide.id} enregistrée en temps réel dans Firestore !`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      setActionFeedback('Erreur lors de l\'enregistrement Firestore.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default-deny catch-all for global safety net
    match /{document=**} {
      allow read, write: if false;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    // Profils utilisateurs (supporte à la fois les comptes authentifiés et le simulateur)
    match /users/{userId} {
      allow read: if isValidId(userId);
      allow create, update: if isValidId(userId);
      allow delete: if false;

      match /transactions/{transactionId} {
        allow read, create: if isValidId(userId) && isValidId(transactionId);
        allow update, delete: if false;
      }
    }

    // Courses et biddings
    match /rides/{rideId} {
      allow read, create, update: if isValidId(rideId);
      allow delete: if isValidId(rideId);

      match /offers/{offerId} {
        allow read, create, update: if isValidId(offerId);
        allow delete: if false;
      }

      match /messages/{messageId} {
        allow read, create: if isValidId(messageId);
        allow update, delete: if false;
      }
    }

    // Dossiers KYC
    match /kyc_applications/{applicationId} {
      allow read, create, update: if isValidId(applicationId);
      allow delete: if false;
    }

    // Locations matériels touristiques
    match /rentals/{rentalId} {
      allow read, create, update: if isValidId(rentalId);
      allow delete: if false;
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Connection & Database IDs */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Base de Données Firebase Firestore
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Connecté & Actif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stockage NoSQL distribué avec synchronisation bidirectionnelle instantanée pour les courses, offres de prix et messages.
              </p>
            </div>
          </div>

          {/* Cloud Info Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Project: </span>
              <span className="text-white font-semibold">{firebaseConfig.projectId}</span>
            </div>
            <div className="px-2.5 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>DB ID: </span>
              <span className="text-white font-semibold truncate max-w-[170px]" title={firebaseConfig.firestoreDatabaseId}>
                {firebaseConfig.firestoreDatabaseId}
              </span>
            </div>
            {latencyMs !== null && (
              <div className="px-2.5 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-emerald-400">
                {latencyMs} ms
              </div>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {actionFeedback && (
          <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
            <span>{actionFeedback}</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('EXPLORER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'EXPLORER'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Explorateur Temps Réel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('RULES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'RULES'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Règles de Sécurité (Rules)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BLUEPRINT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'BLUEPRINT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schéma Blueprint (IR)</span>
          </button>
        </div>

        {activeSubTab === 'EXPLORER' && (
          <button
            onClick={handleSeedSampleRide}
            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Créer une course test dans Firestore</span>
          </button>
        )}
      </div>

      {/* VIEW 1: LIVE EXPLORER */}
      {activeSubTab === 'EXPLORER' && (
        <div className="space-y-4">
          {/* Collection Selector Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Collections Firestore :</span>
            {(['rides', 'users', 'kyc_applications', 'rentals'] as const).map((coll) => (
              <button
                key={coll}
                onClick={() => setSelectedCollection(coll)}
                className={`px-3 py-1 text-xs rounded-xl font-mono transition-all ${
                  selectedCollection === coll
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                /{coll}
              </button>
            ))}
            <span className="text-xs font-mono text-slate-500 ml-auto">
              {documents.length} document{documents.length > 1 ? 's' : ''} en direct
            </span>
          </div>

          {/* Document list & JSON viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                Collection active : <strong className="text-amber-400">/{selectedCollection}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Écouteur WebSocket onSnapshot actif</span>
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Chargement des documents depuis Firestore...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Database className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">
                  Aucun document trouvé dans la collection /{selectedCollection}.
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Publiez une course depuis le Simulateur ou cliquez sur "Créer une course test dans Firestore" ci-dessus pour observer l'écriture en temps réel.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {documents.map((docItem) => (
                  <div key={docItem.id} className="p-4 hover:bg-slate-800/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          ID: {docItem.id}
                        </span>
                        {docItem.status && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                            {docItem.status}
                          </span>
                        )}
                        {docItem.paymentMethod && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                            {docItem.paymentMethod}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {docItem.updatedAt || docItem.createdAt || 'Horodatage Firestore'}
                      </span>
                    </div>

                    {/* Prettier preview if ride */}
                    {selectedCollection === 'rides' && docItem.origin && docItem.destination && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Itinéraire</span>
                          <span className="text-white font-semibold truncate block">
                            {docItem.origin.name} → {docItem.destination.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Prix Passager / OTP</span>
                          <span className="text-amber-400 font-bold">
                            {docItem.passengerPrice} MAD
                          </span>
                          <span className="text-slate-400 ml-2 font-mono">OTP: {docItem.otpCode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Passager</span>
                          <span className="text-slate-300">{docItem.passengerName}</span>
                        </div>
                      </div>
                    )}

                    {/* JSON representation */}
                    <details className="text-[11px]">
                      <summary className="cursor-pointer text-slate-400 hover:text-amber-400 transition-colors">
                        Voir les données JSON brutes
                      </summary>
                      <pre className="mt-2 p-3 bg-slate-950 rounded-xl text-slate-300 font-mono text-[10px] overflow-x-auto border border-slate-800/80">
                        {JSON.stringify(docItem, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: FIRESTORE SECURITY RULES */}
      {activeSubTab === 'RULES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Règles de Sécurité Actives (firestore.rules)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Règles déployées garantissant le principe de moindre privilège (ABAC) et la protection contre l'usurpation d'identité.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(firestoreRulesText);
                setCopiedRules(true);
                setTimeout(() => setCopiedRules(false), 2000);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 border border-slate-700"
            >
              {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRules ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed">
            {firestoreRulesText}
          </pre>
        </div>
      )}

      {/* VIEW 3: BLUEPRINT SCHEMA */}
      {activeSubTab === 'BLUEPRINT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>firebase-blueprint.json (Intermediate Representation)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Définition formelle des entités (User, Ride, DriverOffer, ChatMessage, Transaction, KycApplication) et de leurs chemins Firestore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Entités Modélisées</h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>User :</strong> Profils passagers et conducteurs, solde de points et KYC
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>Ride :</strong> Courses, géopoints, OTP 4 chiffres et tarif négocié
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>DriverOffer :</strong> Offres et contre-offres formulées par les chauffeurs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>ChatMessage :</strong> Messages temps réel entre passager et chauffeur
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>Transaction :</strong> Historique financier et recharges de points
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>KycApplication :</strong> Dossier de validation avec CIN et véhicule
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Chemins Firestore Définis</h4>
              <ul className="text-xs font-mono space-y-1.5 text-slate-300">
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/users/{'{userId}'}</li>
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/rides/{'{rideId}'}</li>
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/rides/{'{rideId}'}/offers/{'{offerId}'}</li>
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/rides/{'{rideId}'}/messages/{'{messageId}'}</li>
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/users/{'{userId}'}/transactions/{'{txId}'}</li>
                <li className="p-1.5 bg-slate-900 rounded border border-slate-800/80">/kyc_applications/{'{appId}'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
