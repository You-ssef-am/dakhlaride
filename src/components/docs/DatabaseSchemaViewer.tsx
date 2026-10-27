import React, { useState } from 'react';
import {
  Database,
  Table,
  Compass,
  Copy,
  Check,
  Key,
  Shield,
  Layers,
  Search,
  Code2,
  Flame,
} from 'lucide-react';
import { FirebaseDatabaseViewer } from './FirebaseDatabaseViewer';

export const DatabaseSchemaViewer: React.FC = () => {
  const [engine, setEngine] = useState<'FIREBASE' | 'POSTGIS'>('FIREBASE');
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('rides');
  const [queryRadiusKm, setQueryRadiusKm] = useState<number>(5);

  const fullDdlSql = `-- =========================================================
-- LIVRABLE 2: SCHÉMA DE LA BASE DE DONNÉES (POSTGRESQL + POSTGIS)
-- Plateforme VTC Dakhla Ride avec Négociation en Temps Réel
-- =========================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types ENUM
CREATE TYPE user_role AS ENUM ('PASSENGER', 'DRIVER');
CREATE TYPE kyc_status AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE ride_status AS ENUM ('SEARCHING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE offer_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'COUNTERED');
CREATE TYPE transaction_type AS ENUM ('PLATFORM_FEE', 'DRIVER_PAYOUT', 'REFUND', 'TOPUP', 'POINTS_RECHARGE');
CREATE TYPE payment_method_type AS ENUM ('POINTS', 'CASH');

-- 1. Table Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,                  -- Compte Gmail / Google OAuth
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    driver_photo_url TEXT,                      -- Photo de profil officielle du chauffeur
    cin_number VARCHAR(20) UNIQUE,              -- Numéro Carte Nationale (ex: OD-89452)
    cin_recto_url TEXT,                         -- Photo Face Avant (Recto) de la CIN
    cin_verso_url TEXT,                         -- Photo Face Arrière (Verso) de la CIN
    points_balance INT DEFAULT 0,               -- Solde de Points Passager (1 Point = 1 MAD)
    bank_rib VARCHAR(24),                       -- RIB bancaire marocain 24 chiffres (Chauffeur)
    bank_name VARCHAR(100),                     -- Banque (ex: Attijariwafa, CIH, BP)
    bank_account_holder VARCHAR(100),           -- Nom titulaire compte bancaire
    rating NUMERIC(3, 2) DEFAULT 5.00,
    current_role user_role DEFAULT 'PASSENGER',
    kyc_status kyc_status DEFAULT 'NOT_SUBMITTED',
    is_online BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Vehicles (Liée aux chauffeurs certifiés KYC)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    color VARCHAR(30) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    registration_doc_url TEXT NOT NULL,
    insurance_doc_url TEXT NOT NULL,
    license_doc_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table Rides (Courses créées par les passagers)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    origin_address TEXT NOT NULL,
    origin_point GEOGRAPHY(Point, 4326) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_point GEOGRAPHY(Point, 4326) NOT NULL,
    recommended_price NUMERIC(10, 2) NOT NULL,
    initial_passenger_price NUMERIC(10, 2) NOT NULL,
    final_price NUMERIC(10, 2),
    payment_method payment_method_type DEFAULT 'POINTS', -- Points Dakhla (1 pt = 1 DH) ou Cash
    status ride_status DEFAULT 'SEARCHING',
    otp_code VARCHAR(4) NOT NULL, -- Code à 4 chiffres généré à la réservation
    distance_meters INT NOT NULL,
    duration_seconds INT NOT NULL,
    driver_confirmed BOOLEAN DEFAULT FALSE,     -- Signalement arrivée par chauffeur
    passenger_confirmed BOOLEAN DEFAULT FALSE,  -- Double validation obligatoire par le client
    passenger_rating INT,                       -- Note attribuée au chauffeur (1 à 5 étoiles)
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table Offers (Enchères et contre-propositions en temps réel)
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id),
    offered_price NUMERIC(10, 2) NOT NULL,
    eta_minutes INT NOT NULL,
    status offer_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Transactions (Portefeuille et commissions 15%)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    ride_id UUID REFERENCES rides(id),
    amount NUMERIC(10, 2) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    balance_after NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index Géospatiaux GiST & Index de Performances
CREATE INDEX idx_users_location ON users USING GIST(current_location);
CREATE INDEX idx_rides_origin ON rides USING GIST(origin_point);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_offers_ride_driver ON offers(ride_id, driver_id);`;

  const tablesMetadata: Record<string, { desc: string; columns: { name: string; type: string; key?: string; notes: string }[] }> = {
    users: {
      desc: 'Table unifiée des utilisateurs (Passagers et Chauffeurs). Gère les comptes Gmail, identifiants téléphoniques, rôles dynamiques, photos de profil, Carte Nationale (CIN), statut KYC et coordonnées GPS temps réel.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', notes: 'Identifiant unique (uuid_generate_v4)' },
        { name: 'email', type: 'VARCHAR(255)', key: 'UQ', notes: 'Compte Google / Gmail (ex: dakhlaride@gmail.com)' },
        { name: 'phone_number', type: 'VARCHAR(20)', key: 'UQ', notes: 'Numéro normalisé E.164 (ex: +212661234567)' },
        { name: 'full_name', type: 'VARCHAR(100)', notes: 'Nom complet du passager ou chauffeur' },
        { name: 'driver_photo_url', type: 'TEXT', notes: 'Photo de profil officielle pour identification par le passager' },
        { name: 'cin_number', type: 'VARCHAR(20)', key: 'UQ', notes: 'Numéro de Carte Nationale CIN (ex: OD-89452)' },
        { name: 'cin_recto_url', type: 'TEXT', notes: 'URL sécurisée de la photo Recto de la Carte Nationale' },
        { name: 'cin_verso_url', type: 'TEXT', notes: 'URL sécurisée de la photo Verso de la Carte Nationale' },
        { name: 'rating', type: 'NUMERIC(3,2)', notes: 'Note moyenne sur 5 étoiles (défaut 5.00)' },
        { name: 'current_role', type: 'user_role', notes: "ENUM: 'PASSENGER' ou 'DRIVER'" },
        { name: 'kyc_status', type: 'kyc_status', notes: "ENUM: 'NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'" },
        { name: 'is_online', type: 'BOOLEAN', notes: 'Disponibilité chauffeur pour le radar' },
        { name: 'current_location', type: 'GEOGRAPHY(Point,4326)', notes: 'Position GPS indexée GiST pour calculs de proximité' }
      ]
    },
    vehicles: {
      desc: 'Véhicules certifiés des chauffeurs. Liés aux pièces justificatives scannées (permis, carte grise, assurance).',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', notes: 'Clé primaire véhicule' },
        { name: 'driver_id', type: 'UUID', key: 'FK', notes: 'Référence unique vers users(id)' },
        { name: 'make', type: 'VARCHAR(50)', notes: 'Marque (ex: Dacia, Toyota, Hyundai)' },
        { name: 'model', type: 'VARCHAR(50)', notes: 'Modèle (ex: Logan, Corolla Hybrid, Tucson)' },
        { name: 'color', type: 'VARCHAR(30)', notes: 'Couleur carrosserie' },
        { name: 'license_plate', type: 'VARCHAR(20)', key: 'UQ', notes: 'Immatriculation officielle' },
        { name: 'registration_doc_url', type: 'TEXT', notes: 'URL sécurisée S3 de la carte grise' },
        { name: 'insurance_doc_url', type: 'TEXT', notes: "URL de l'attestation d'assurance professionnelle" },
        { name: 'is_active', type: 'BOOLEAN', notes: 'Validation administrative' }
      ]
    },
    rides: {
      desc: 'Courses sollicitées par les passagers, stockant les points géospatiaux de prise en charge et de destination, le code OTP et la négociation finale.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', notes: 'Identifiant unique de la course' },
        { name: 'passenger_id', type: 'UUID', key: 'FK', notes: 'Référence vers users(id) du passager' },
        { name: 'driver_id', type: 'UUID', key: 'FK', notes: 'Chauffeur sélectionné (NULL au début)' },
        { name: 'origin_point', type: 'GEOGRAPHY(Point,4326)', notes: 'Coordonnées GPS de prise en charge (GiST)' },
        { name: 'destination_point', type: 'GEOGRAPHY(Point,4326)', notes: 'Coordonnées GPS destination' },
        { name: 'recommended_price', type: 'NUMERIC(10,2)', notes: 'Tarif calculé algorithmiquement (distance + durée)' },
        { name: 'initial_passenger_price', type: 'NUMERIC(10,2)', notes: 'Montant proposé par le passager' },
        { name: 'final_price', type: 'NUMERIC(10,2)', notes: 'Prix conclu après négociation' },
        { name: 'status', type: 'ride_status', notes: "SEARCHING, ACCEPTED, ARRIVED, IN_PROGRESS, COMPLETED..." },
        { name: 'otp_code', type: 'VARCHAR(4)', notes: 'Code secret à 4 chiffres généré pour validation départ' },
        { name: 'distance_meters', type: 'INT', notes: 'Distance routière calculée en mètres' },
        { name: 'duration_seconds', type: 'INT', notes: 'Durée estimée en secondes' }
      ]
    },
    offers: {
      desc: "Table des enchères et contre-propositions soumises en temps réel par les chauffeurs à l'écoute sur le rayon spatial.",
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', notes: "Identifiant de l'offre" },
        { name: 'ride_id', type: 'UUID', key: 'FK', notes: 'Référence vers rides(id)' },
        { name: 'driver_id', type: 'UUID', key: 'FK', notes: 'Référence vers users(id)' },
        { name: 'offered_price', type: 'NUMERIC(10,2)', notes: 'Prix proposé par le chauffeur' },
        { name: 'eta_minutes', type: 'INT', notes: "Temps d'approche estimé en minutes" },
        { name: 'status', type: 'offer_status', notes: "PENDING, ACCEPTED, REJECTED, EXPIRED, COUNTERED" }
      ]
    },
    transactions: {
      desc: 'Grand livre comptable (Ledger) pour le portefeuille virtuel des chauffeurs et le prélèvement des commissions plateforme (15%).',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', notes: 'Identifiant transaction' },
        { name: 'user_id', type: 'UUID', key: 'FK', notes: 'Bénéficiaire (chauffeur)' },
        { name: 'ride_id', type: 'UUID', key: 'FK', notes: 'Course associée' },
        { name: 'amount', type: 'NUMERIC(10,2)', notes: 'Montant crédité ou débité' },
        { name: 'type', type: 'transaction_type', notes: "PLATFORM_FEE (-15%), DRIVER_PAYOUT, RIDE_EARNING..." },
        { name: 'balance_after', type: 'NUMERIC(10,2)', notes: 'Solde mis à jour après opération' }
      ]
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDdlSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Engine Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEngine('FIREBASE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              engine === 'FIREBASE'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Base Firebase Firestore (Temps Réel)</span>
            <span className="text-[10px] bg-slate-950/40 text-current px-1.5 py-0.5 rounded-full font-mono">
              Live Cloud
            </span>
          </button>

          <button
            onClick={() => setEngine('POSTGIS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              engine === 'POSTGIS'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Architecture PostGIS (DDL & Spatiale)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono px-3 hidden sm:block">
          {engine === 'FIREBASE' ? '🔥 Firestore Cloud Sync' : '🐘 PostgreSQL 16 + PostGIS 3.4'}
        </div>
      </div>

      {engine === 'FIREBASE' ? (
        <FirebaseDatabaseViewer />
      ) : (
        <>
          {/* Intro Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">
                    Livrable 2 : Schéma de Base de Données (PostgreSQL + PostGIS)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                  Modèle relationnel optimisé pour le traitement géospatial haute performance. Exploite le type <code className="text-amber-400 font-mono">GEOGRAPHY(Point, 4326)</code> avec indexation spatiale <strong>GiST</strong> pour un filtrage instantané <code className="text-amber-400 font-mono">ST_DWithin</code> des chauffeurs disponibles autour du point de prise en charge.
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'DDL SQL copié' : 'Copier script DDL'}</span>
              </button>
            </div>
          </div>

      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.keys(tablesMetadata).map((tableName) => (
          <button
            key={tableName}
            onClick={() => setSelectedTable(tableName)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              selectedTable === tableName
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{tableName}</span>
          </button>
        ))}
      </div>

      {/* Table Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-mono">Table: {selectedTable}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              PostgreSQL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{tablesMetadata[selectedTable].desc}</p>
        </div>

        {/* Column table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Colonne</th>
                <th className="py-2.5 px-3">Type SQL</th>
                <th className="py-2.5 px-3">Clé</th>
                <th className="py-2.5 px-3">Description & Rôle Métier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {tablesMetadata[selectedTable].columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">{col.name}</td>
                  <td className="py-2.5 px-3 text-amber-400">{col.type}</td>
                  <td className="py-2.5 px-3">
                    {col.key === 'PK' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        PK
                      </span>
                    )}
                    {col.key === 'FK' && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                        FK
                      </span>
                    )}
                    {col.key === 'UQ' && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                        UNIQUE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-xs">{col.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PostGIS Geospatial Query Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Requête Spatiale PostGIS : Recherche des Chauffeurs Proches (Rayon de diffusion)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Rayon :</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[3, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setQueryRadiusKm(r)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                    queryRadiusKm === r
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>

        <pre className="text-xs font-mono text-sky-200 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed">
{`-- Trouver tous les chauffeurs en ligne certifiés KYC dans un rayon de ${queryRadiusKm * 1000} mètres
-- autour du point de prise en charge (ex: Aéroport Dakhla 23.7183, -15.9322)
SELECT 
    u.id AS driver_id,
    u.full_name,
    u.rating,
    v.make || ' ' || v.model AS car_model,
    v.license_plate,
    ROUND(ST_Distance(u.current_location, ST_MakePoint(-15.9322, 23.7183)::geography)) AS distance_meters,
    ROUND(ST_Distance(u.current_location, ST_MakePoint(-15.9322, 23.7183)::geography) / 500) AS eta_minutes
FROM users u
INNER JOIN vehicles v ON v.driver_id = u.id AND v.is_active = TRUE
WHERE u.current_role = 'DRIVER'
  AND u.is_online = TRUE
  AND u.kyc_status = 'APPROVED'
  AND ST_DWithin(
      u.current_location,
      ST_MakePoint(-15.9322, 23.7183)::geography,
      ${queryRadiusKm * 1000} -- Distance en mètres
  )
ORDER BY distance_meters ASC
LIMIT 10;`}
        </pre>
      </div>

      {/* Full DDL Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Code DDL SQL Exhaustif (PostgreSQL 16 + PostGIS 3.4)</h3>
        </div>
        <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto max-h-[350px] leading-relaxed">
          {fullDdlSql}
        </pre>
      </div>
        </>
      )}
    </div>
  );
};
