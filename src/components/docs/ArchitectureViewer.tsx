import React, { useState } from 'react';
import {
  FolderTree,
  Layers,
  Cpu,
  Share2,
  FileCode,
  Shield,
  Radio,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<string>('role_bloc.dart');

  const fileTreeText = `lib/
├── app/
│   ├── app.dart                   # Racine MaterialApp, injection des Blocs globaux
│   ├── router/                    # GoRouter avec redirection dynamique selon Role & Auth
│   └── theme/                     # Design System (Tokens, UI kit)
├── core/
│   ├── constants/                 # Endpoints, WebSocket events, storage keys
│   ├── network/
│   │   ├── http_client.dart       # Dio wrapper avec intercepteurs JWT & Refresh Token
│   │   └── websocket_client.dart  # Client WebSocket persistant (reconnexion, heartbeat)
│   ├── services/
│   │   ├── location_service.dart  # Background GPS (Driver) vs Foreground (Passenger)
│   │   ├── storage_service.dart   # FlutterSecureStorage (tokens, active_role)
│   │   └── notification_service.dart # Firebase Cloud Messaging
│   └── errors/                    # Failures & Exceptions custom
├── features/
│   ├── auth/                      # Inscription OTP SMS, Sessions
│   ├── role_switcher/             # Gestion du rôle actif et guard de validation KYC
│   ├── kyc/                       # Upload pièces justificatives (permis, CG, assurance)
│   ├── passenger/
│   │   ├── booking/               # Sélection Adresses, Calcul Polyline & Prix suggéré
│   │   ├── negotiation/           # Salle d'enchères temps réel (réception des offres)
│   │   └── active_ride/           # Suivi direct, affichage code OTP, bouton SOS
│   ├── driver/
│   │   ├── feed/                  # Radar des courses proches (PostGIS radius stream)
│   │   ├── negotiation/           # Boutons contre-offres (+10DH, +20DH, custom)
│   │   ├── active_trip/           # Navigation Mapbox/Google, pavé de saisie OTP
│   │   └── wallet/                # Solde, commissions de la plateforme, retraits
│   └── shared/
│       ├── map/                   # Composant Map unifié (Mapbox GL / Google Maps)
│       └── chat/                  # Tchat in-app passager/chauffeur
└── main.dart`;

  const sampleCodes: Record<string, string> = {
    'role_bloc.dart': `// features/role_switcher/presentation/bloc/role_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/user_role.dart';
import '../../domain/repositories/i_role_repository.dart';

// États
abstract class RoleState {
  final AppRole currentRole;
  final KycStatus kycStatus;
  const RoleState({required this.currentRole, required this.kycStatus});
}

class RoleLoadedState extends RoleState {
  const RoleLoadedState({required super.currentRole, required super.kycStatus});
}

// Événements
abstract class RoleEvent {}
class SwitchRoleEvent extends RoleEvent {
  final AppRole targetRole;
  SwitchRoleEvent(this.targetRole);
}

// BLoC avec injection du repository
class RoleBloc extends Bloc<RoleEvent, RoleState> {
  final IRoleRepository roleRepository;
  final IWebSocketClient wsClient;

  RoleBloc({required this.roleRepository, required this.wsClient})
      : super(const RoleLoadedState(currentRole: AppRole.passenger, kycStatus: KycStatus.notSubmitted)) {
    on<SwitchRoleEvent>(_onSwitchRole);
  }

  Future<void> _onSwitchRole(SwitchRoleEvent event, Emitter<RoleState> emit) async {
    // 1. Sauvegarde du rôle dans le stockage sécurisé
    await roleRepository.saveActiveRole(event.targetRole);

    // 2. Reconfiguration des flux WebSockets
    if (event.targetRole == AppRole.driver) {
      wsClient.unsubscribe('passenger:rides');
      wsClient.subscribe('driver:geofence:dakhla');
    } else {
      wsClient.unsubscribe('driver:geofence:dakhla');
      wsClient.subscribe('passenger:rides');
    }

    emit(RoleLoadedState(currentRole: event.targetRole, kycStatus: state.kycStatus));
  }
}`,
    'location_service.dart': `// core/services/location_service.dart
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../network/websocket_client.dart';

class DriverLocationService {
  final WebSocketClient _wsClient;
  StreamSubscription<Position>? _positionSub;
  Position? _lastDispatchedPosition;

  DriverLocationService(this._wsClient);

  void startTracking({required String driverId}) {
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 15, // Seuil de déplacement : 15 mètres
    );

    _positionSub = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) {
      // Throttle & émission WebSocket vers PostGIS
      _wsClient.emit('driver:location:update', {
        'driver_id': driverId,
        'lat': position.latitude,
        'lng': position.longitude,
        'heading': position.heading,
        'speed_kmh': position.speed * 3.6,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
      _lastDispatchedPosition = position;
    });
  }

  void stopTracking() {
    _positionSub?.cancel();
  }
}`,
    'websocket_client.dart': `// core/network/websocket_client.dart
import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketClient {
  WebSocketChannel? _channel;
  final _eventController = StreamController<Map<String, dynamic>>.broadcast();
  Timer? _heartbeatTimer;

  Stream<Map<String, dynamic>> get stream => _eventController.stream;

  void connect(String wsUrl, String authToken) {
    _channel = WebSocketChannel.connect(Uri.parse('$wsUrl?token=$authToken'));
    _channel!.stream.listen(
      (data) {
        final decoded = jsonDecode(data as String) as Map<String, dynamic>;
        _eventController.add(decoded);
      },
      onError: (err) => _scheduleReconnect(),
      onDone: () => _scheduleReconnect(),
    );
    _startHeartbeat();
  }

  void emit(String event, Map<String, dynamic> payload) {
    final frame = jsonEncode({
      'event': event,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'payload': payload,
    });
    _channel?.sink.add(frame);
  }
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileTreeText);
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
              <FolderTree className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Livrable 1 : Arborescence Mobile & Gestion d'État (Flutter Clean Architecture)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
              Architecture <strong>Single Binary App</strong> combinant le pattern <strong>BLoC</strong> avec une approche <strong>Feature-First</strong>. Les flux temps réel et les contextes Passager/Conducteur sont isolés pour garantir l'absence de fuites mémoire et une synchronisation instantanée du matériel GPS et des WebSockets.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Arborescence copiée' : 'Copier arborescence'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 Pillars of State Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>1. RoleBloc (Global Root)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conserve l'état <code className="text-indigo-300 font-mono">CurrentRoleState</code> (Passager ou Conducteur) et le statut de certification KYC. Pilote la reconfiguration automatique des abonnements WebSockets et la persistance du rôle dans le trousseau sécurisé (<code className="text-indigo-300 font-mono">FlutterSecureStorage</code>).
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Radio className="w-4 h-4" />
            <span>2. Scoped Negotiation Blocs</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <code className="text-amber-300 font-mono">PassengerNegotiationBloc</code> et <code className="text-amber-300 font-mono">DriverNegotiationBloc</code> sont instanciés uniquement sur leurs écrans respectifs. Ils consomment les flux d'offres en direct et disposent d'un cycle de vie borné qui libère les ressources dès la fin de course.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Layers className="w-4 h-4" />
            <span>3. DriverLocationBloc & Filtre</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Actif exclusivement en mode conducteur avec lissage de trajectoire (filtre de Kalman). Émet la position GPS avec un <strong>distanceFilter de 15m</strong> ou un throttle de 4 secondes vers PostGIS pour limiter la consommation de batterie et la charge réseau.
          </p>
        </div>
      </div>

      {/* Split: File Tree Text & Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ASCII Tree */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <span className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-amber-400" />
            Arborescence du projet Flutter
          </span>
          <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto flex-1 leading-relaxed">
            {fileTreeText}
          </pre>
        </div>

        {/* Right: Code Sample Tabs */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Composants d'Architecture Clés</span>
            </div>
            {/* File Switcher Tabs */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {Object.keys(sampleCodes).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFile(f)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                    activeFile === f
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto flex-1 leading-relaxed max-h-[460px]">
            {sampleCodes[activeFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
