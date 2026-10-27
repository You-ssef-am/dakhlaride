import React, { useState } from 'react';
import { WebSocketLogEvent } from '../../types/ride';
import {
  Radio,
  Share2,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WebSocketSpecsViewerProps {
  logs: WebSocketLogEvent[];
  onClearLogs?: () => void;
}

export const WebSocketSpecsViewer: React.FC<WebSocketSpecsViewerProps> = ({
  logs,
  onClearLogs,
}) => {
  const [selectedEventName, setSelectedEventName] = useState<string>('ride:create');
  const [copied, setCopied] = useState(false);

  const eventSchemas: Record<
    string,
    { direction: string; sender: string; target: string; desc: string; sample: any }
  > = {
    'ride:create': {
      direction: 'Client -> Gateway',
      sender: 'Passager',
      target: 'Serveur WebSocket (Redis Adapter)',
      desc: 'Émis par le passager pour initier une réservation avec point de prise en charge, destination et proposition de prix initiale.',
      sample: {
        event: 'ride:create',
        correlation_id: 'req-uuid-9841',
        timestamp: 1714589200000,
        payload: {
          origin: { lat: 23.7183, lng: -15.9322, address: 'Aéroport Dakhla' },
          destination: { lat: 23.7088, lng: -15.9351, address: 'Centre-Ville Dakhla' },
          proposed_price: 35.0,
          distance_meters: 6400,
          duration_seconds: 720,
        },
      },
    },
    'ride:broadcast': {
      direction: 'Gateway -> Drivers',
      sender: 'Serveur',
      target: 'Room spatiale drivers:zone_dakhla',
      desc: 'Diffusé aux chauffeurs situés dans le rayon PostGIS (5 km) avec un délai de validité (TTL) pour soumettre des offres.',
      sample: {
        event: 'ride:broadcast',
        correlation_id: 'bc-uuid-4412',
        timestamp: 1714589201200,
        payload: {
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          passenger: { full_name: 'Karim Bennani', rating: 4.92 },
          origin: { lat: 23.7183, lng: -15.9322, address: 'Aéroport Dakhla' },
          destination: { lat: 23.7088, lng: -15.9351, address: 'Centre-Ville' },
          client_price: 35.0,
          expires_in_seconds: 30,
        },
      },
    },
    'driver:offer:submit': {
      direction: 'Client -> Gateway',
      sender: 'Conducteur',
      target: 'Serveur WebSocket',
      desc: 'Le chauffeur accepte au prix du client ou propose une contre-offre majorée avec son estimation de temps d’arrivée (ETA).',
      sample: {
        event: 'driver:offer:submit',
        correlation_id: 'dr-off-1123',
        timestamp: 1714589204500,
        payload: {
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          offered_price: 40.0,
          eta_minutes: 3,
          current_location: { lat: 23.7195, lng: -15.934 },
        },
      },
    },
    'ride:offer:received': {
      direction: 'Gateway -> Passenger',
      sender: 'Serveur',
      target: 'Room privée user:passenger_id',
      desc: 'Transmet au passager les détails du chauffeur, la notation, le véhicule et le prix proposé pour affichage comparatif.',
      sample: {
        event: 'ride:offer:received',
        correlation_id: 'fwd-off-8831',
        timestamp: 1714589205100,
        payload: {
          offer_id: '4a73e5bf-9a74-4b52-b13c-fbdf231c5cf1',
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          driver: {
            id: 'drv_omar',
            name: 'Omar Tazi',
            rating: 4.88,
            vehicle: { make: 'Toyota', model: 'Corolla', color: 'Gris Métal', plate: '12-A-89452' },
          },
          offered_price: 40.0,
          eta_minutes: 3,
        },
      },
    },
    'passenger:offer:accept': {
      direction: 'Passenger -> Gateway',
      sender: 'Passager',
      target: 'Serveur WebSocket',
      desc: 'Sélection définitive par le passager d’une offre chauffeur.',
      sample: {
        event: 'passenger:offer:accept',
        correlation_id: 'acc-uuid-9912',
        timestamp: 1714589209400,
        payload: {
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          offer_id: '4a73e5bf-9a74-4b52-b13c-fbdf231c5cf1',
        },
      },
    },
    'ride:matched': {
      direction: 'Gateway -> Both Parties',
      sender: 'Serveur',
      target: 'Passager & Chauffeur Sélectionné',
      desc: 'Verrouillage de la course. Le code OTP secret (4 chiffres) est transmis au passager ; les autres offres concurrentes sont invalidées.',
      sample: {
        event: 'ride:matched',
        correlation_id: 'mtc-uuid-0034',
        timestamp: 1714589210000,
        payload: {
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          status: 'ACCEPTED',
          final_price: 40.0,
          otp_code: '4819', // Masqué pour le chauffeur, visible pour le passager
        },
      },
    },
    'driver:otp:verify': {
      direction: 'Driver -> Gateway',
      sender: 'Conducteur',
      target: 'Serveur WebSocket',
      desc: 'Saisie du code OTP du passager par le chauffeur pour débloquer et démarrer officiellement la course.',
      sample: {
        event: 'driver:otp:verify',
        correlation_id: 'otp-val-5521',
        timestamp: 1714589240000,
        payload: {
          ride_id: '8b51d8d8-7917-48f8-bca7-e160aebc30d2',
          otp_input: '4819',
        },
      },
    },
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Livrable 3 : Spécifications des Événements WebSockets (Bidding & Suivi Temps Réel)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
              Protocole bidirectionnel sur WebSockets / gRPC encapsulé dans une enveloppe standardisée (<code className="text-amber-400 font-mono">event</code>, <code className="text-amber-400 font-mono">correlation_id</code>, <code className="text-amber-400 font-mono">timestamp</code>, <code className="text-amber-400 font-mono">payload</code>) orchestré par Redis Pub/Sub pour le scaling horizontal.
            </p>
          </div>
        </div>
      </div>

      {/* Sequence Diagram Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">
            Diagramme de Séquence : Négociation, Paiement par Points & Double Validation de Fin
          </h3>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`PASSAGER (Client)                 SERVEUR (Node/Go + Redis)                 CHAUFFEURS (Rayon 5km)
       │                                     │                                       │
       │─── 1. ride:create (Points/Cash) ───>│                                       │
       │                                     │─── 2. ride:broadcast (Geo PostGIS) ──>│
       │                                     │                                       │
       │                                     │<── 3. driver:offer:submit (Prix/ETA) ─│
       │<── 4. ride:offer:received ──────────│                                       │
       │    (Comparateur d'offres en direct) │                                       │
       │                                     │                                       │
       │─── 5. passenger:offer:accept ──────>│                                       │
       │                                     │─── 6. ride:matched (Avec OTP) ───────>│ (Attribution)
       │                                     │─── 7. ride:cancelled ────────────────>│ (Autres)
       │                                     │                                       │
       │                                     │<── 8. driver:status:arrived ──────────│
       │     (Transmission verbale OTP)      │                                       │
       │                                     │<── 9. driver:otp:verify ("4819") ─────│
       │<── 10. ride:started (En route) ─────│─── 10. ride:started ──────────────────>│
       │                                     │                                       │
       │                                     │<── 11. driver:status:completed ───────│ (Chauffeur sur place)
       │<── 12. ride:verify:requested ───────│                                       │
       │                                     │                                       │
       │─── 13. passenger:ride:confirmed ───>│                                       │ [NOUVEAU]
       │    (Validation client + Note 5★)    │                                       │ Double confirmation
       │                                     │─── 14. ride:finalized:success ───────>│ & Débit Points
       │<── 15. Débit solde Points (1 pt=1DH)│─── 15. Crédit Portefeuille (-15%) ───>│
       │                                     │                                       │
       │                                     │<── 16. driver:payout:request (RIB) ───│ [NOUVEAU]
       │                                     │─── 17. Virement SIMT interbancaire ──>│ (Vers Attijari/CIH)`}
        </div>
      </div>

      {/* Interactive Event Dictionary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Event Selection list */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-2">
          <span className="text-xs font-bold text-white mb-1">Dictionnaire des Événements</span>
          {Object.keys(eventSchemas).map((evt) => {
            const item = eventSchemas[evt];
            const isSelected = selectedEventName === evt;
            return (
              <button
                key={evt}
                onClick={() => setSelectedEventName(evt)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{evt}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.direction}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Event JSON Payload */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400">{selectedEventName}</span>
              <p className="text-xs text-slate-400 mt-0.5">
                De : <strong className="text-white">{eventSchemas[selectedEventName].sender}</strong> → Vers : <strong className="text-white">{eventSchemas[selectedEventName].target}</strong>
              </p>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(eventSchemas[selectedEventName].sample, null, 2))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copier payload</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {eventSchemas[selectedEventName].desc}
          </p>

          <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto flex-1 leading-relaxed">
            {JSON.stringify(eventSchemas[selectedEventName].sample, null, 2)}
          </pre>
        </div>
      </div>

      {/* Live WebSocket Event Stream (Connected to Simulator) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Inspecteur de Flux WebSocket en Direct (Émis par le Simulateur)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {logs.length} trames capturées
            </span>
          </div>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Effacer les trames
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
            Aucun événement pour le moment. Cliquez sur "Trouver un chauffeur" ou effectuez une offre dans le simulateur pour voir les trames WebSocket capturées en temps réel.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 hover:border-slate-700 flex flex-col gap-1 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        log.sender === 'PASSENGER'
                          ? 'bg-sky-500/20 text-sky-400'
                          : log.sender === 'DRIVER'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {log.sender}
                    </span>
                    <span className="text-white font-bold">{log.event}</span>
                    <span className="text-slate-500 text-[10px]">({log.correlationId})</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-400 font-sans text-xs">{log.summary}</p>
                <details className="mt-1">
                  <summary className="text-[10px] text-amber-400 cursor-pointer hover:underline">
                    Voir payload JSON
                  </summary>
                  <pre className="mt-1 p-2 bg-slate-900 rounded-lg text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
