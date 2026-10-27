import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Eye,
  Database,
  MapPin,
  FileText,
  UserCheck,
  CreditCard,
  Scale,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'DATA' | 'GEOLOC' | 'KYC' | 'SECURITY' | 'RIGHTS'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Politique de Confidentialité & Protection des Données</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Loi marocaine n° 09-08 & RGPD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plateforme VTC & Tourisme Dakhla Ride · Dernière mise à jour : 27 Octobre 2026
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'OVERVIEW'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Introduction</span>
          </button>

          <button
            onClick={() => setActiveSection('DATA')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'DATA'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Données Collectées</span>
          </button>

          <button
            onClick={() => setActiveSection('GEOLOC')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'GEOLOC'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Géolocalisation GPS</span>
          </button>

          <button
            onClick={() => setActiveSection('KYC')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'KYC'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Vérification KYC & CIN</span>
          </button>

          <button
            onClick={() => setActiveSection('SECURITY')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'SECURITY'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sécurité & Firebase</span>
          </button>

          <button
            onClick={() => setActiveSection('RIGHTS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'RIGHTS'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Vos Droits (CNDP)</span>
          </button>
        </div>

        {/* Scrollable Content Zone */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 text-xs leading-relaxed text-slate-300">
          {activeSection === 'OVERVIEW' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>1. Engagement de Dakhla Ride</span>
                </h3>
                <p>
                  La protection de vos données personnelles est une priorité absolue pour <strong>Dakhla Ride</strong> (exploité à Dakhla, Région Dakhla-Oued Ed-Dahab, Maroc).
                </p>
                <p>
                  Cette politique de confidentialité décrit en toute transparence la manière dont nous collectons, utilisons, stockons, protégeons et partageons les informations des <strong>passagers</strong>, des <strong>chauffeurs partenaires</strong>, et des <strong>utilisateurs de matériel touristique</strong>.
                </p>
                <p>
                  Notre traitement des données est rigoureusement conforme à la <strong>loi marocaine n° 09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, ainsi qu'aux standards internationaux de sécurité informatique (RGPD / GDPR).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <Lock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">Chiffrement SSL/TLS</span>
                  <span className="text-[10px] text-slate-400">Échanges chiffrés de bout en bout</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <Database className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">Firebase Firestore</span>
                  <span className="text-[10px] text-slate-400">Règles de sécurité ABAC strictes</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <Scale className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">Conformité CNDP</span>
                  <span className="text-[10px] text-slate-400">Droit d'accès & de suppression</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'DATA' && (
            <div className="space-y-3.5 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>2. Nature des Données Collectées</span>
              </h3>
              <p>Nous collectons uniquement les données strictement nécessaires au bon fonctionnement du service :</p>

              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-amber-400 block mb-1">A. Données de compte & profil :</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Nom complet, adresse e-mail (authentification Google / Gmail) et numéro de téléphone mobile marocain.</li>
                    <li>Photo de profil (pour identification sécurisée du chauffeur par le passager).</li>
                    <li>Rôle sélectionné (Passager ou Conducteur VTC).</li>
                    <li>Historique des notes, avis et courses effectuées.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-sky-400 block mb-1">B. Données financières & portefeuille :</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Solde de points Dakhla (1 Point = 1 MAD) et historique des recharges.</li>
                    <li>Relevé d'Identité Bancaire (RIB) à 24 chiffres du chauffeur pour le versement des gains par virement interbancaire.</li>
                    <li>Aucune coordonnée complète de carte bancaire n'est stockée sur nos serveurs (déléguée aux passerelles certifiées PCI-DSS).</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">C. Données de location de matériel touristique :</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Matériels réservés (GoPro, kitesurf, quads, fatbikes), durées et lieux de retrait à Dakhla.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'GEOLOC' && (
            <div className="space-y-3.5 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>3. Utilisation de la Géolocalisation GPS</span>
              </h3>
              <p>
                La géolocalisation est au cœur de l'expérience Dakhla Ride. Voici comment elle est encadrée :
              </p>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Calcul de proximité PostGIS (ST_DWithin)</span>
                </div>
                <p>
                  Lorsque vous demandez une course, vos coordonnées de départ et d'arrivée sont transmises uniquement aux chauffeurs actifs dans un <strong>rayon de 5 km</strong> (Aéroport VIL, Centre-Ville, Spot PK25, Lagune).
                </p>
                <p>
                  La position du chauffeur en approche est rafraîchie en temps réel via WebSockets sécurisés pour vous donner un temps d'attente (ETA) précis.
                </p>
                <p className="text-amber-400/90 font-medium">
                  Important : Nous ne suivons JAMAIS votre position en arrière-plan en dehors des courses actives.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'KYC' && (
            <div className="space-y-3.5 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>4. Vérification d'Identité KYC (Conducteurs)</span>
              </h3>
              <p>
                Pour garantir la sécurité physique des passagers à Dakhla, tout utilisateur souhaitant passer en <strong>Mode Conducteur</strong> doit obligatoirement compléter le protocole KYC :
              </p>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>Carte Nationale d'Identité Électronique (CNIE) :</strong> Scan officiel recto et verso avec numéro de CIN vérifié.
                  </li>
                  <li>
                    <strong>Permis de conduire & Documents du véhicule :</strong> Carte grise, assurance professionnelle valide et immatriculation.
                  </li>
                  <li>
                    <strong>Photo de profil officielle :</strong> Comparée à la pièce d'identité pour éviter toute usurpation.
                  </li>
                  <li>
                    <strong>Code de sécurité OTP à 4 chiffres :</strong> Échangé verbalement au moment de la montée pour confirmer que le bon passager monte dans le bon véhicule.
                  </li>
                </ul>
                <p className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                  Les documents KYC sont stockés dans un compartiment sécurisé Firebase Storage avec accès strictement réservé aux administrateurs de la plateforme.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'SECURITY' && (
            <div className="space-y-3.5 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>5. Sécurité, Chiffrement & Cloud Firebase</span>
              </h3>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <p>
                  Toutes les données de l'application sont hébergées sur l'infrastructure Google Cloud / Firebase Firestore certifiée ISO 27001, SOC 1/2/3.
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2Icon /> <span>Protocole TLS 1.3 / Chiffrement AES-256 au repos</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2Icon /> <span>Firestore Security Rules (ABAC) sans privilèges superflus</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2Icon /> <span>Aucun mot de passe en clair (Tokens OAuth 2.0 / Firebase Auth)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'RIGHTS' && (
            <div className="space-y-3.5 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>6. Vos Droits (Loi 09-08 & CNDP)</span>
              </h3>
              <p>
                Conformément à la législation marocaine, vous disposez des droits suivants à tout moment :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block">Droit d'accès & d'information :</strong>
                  <span className="text-slate-400 text-[11px]">
                    Consulter l'ensemble des données personnelles enregistrées sur votre compte.
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block">Droit de rectification :</strong>
                  <span className="text-slate-400 text-[11px]">
                    Corriger immédiatement votre nom, photo, téléphone ou RIB dans vos paramètres.
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block">Droit à l'effacement (« Droit à l'oubli ») :</strong>
                  <span className="text-slate-400 text-[11px]">
                    Demander la suppression définitive de votre compte et de vos données associées.
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block">Droit d'opposition :</strong>
                  <span className="text-slate-400 text-[11px]">
                    Refuser l'utilisation de vos données à des fins statistiques ou commerciales.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Délégué à la Protection des Données (DPO) :</span>
                  <span className="font-mono text-amber-400 font-bold">dakhlaride@gmail.com</span>
                </div>
                <a
                  href="mailto:dakhlaride@gmail.com"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contacter le DPO</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Données hébergées en conformité avec la CNDP</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
          >
            J'ai compris & Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

function CheckCircle2Icon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
