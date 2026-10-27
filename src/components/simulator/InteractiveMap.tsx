import React, { useEffect, useState } from 'react';
import { LocationPoint, RideStatus, VehicleType } from '../../types/ride';
import {
  Navigation,
  MapPin,
  Radio,
  Compass,
  Car,
  Bus,
  Bike,
  Truck,
  Layers,
  Crosshair,
} from 'lucide-react';
import { DAKHLA_LOCATIONS } from '../../data/mockData';

interface InteractiveMapProps {
  origin?: LocationPoint;
  destination?: LocationPoint;
  status: RideStatus;
  driverEtaMinutes?: number;
  showOtherDrivers?: boolean;
  vehicleType?: VehicleType;
  onSelectOrigin?: (loc: LocationPoint) => void;
  onSelectDestination?: (loc: LocationPoint) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  status,
  showOtherDrivers = true,
  vehicleType = 'VOITURE',
  onSelectOrigin,
  onSelectDestination,
}) => {
  const [carProgress, setCarProgress] = useState(0);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Smooth car animation depending on trip state
  useEffect(() => {
    let interval: any;
    if (status === 'ACCEPTED') {
      // Driver moving towards pickup
      setCarProgress(15);
      interval = setInterval(() => {
        setCarProgress((prev) => (prev >= 90 ? 90 : prev + 4));
      }, 700);
    } else if (status === 'ARRIVED') {
      setCarProgress(96);
    } else if (status === 'IN_PROGRESS') {
      // Driver moving from pickup to destination
      setCarProgress(5);
      interval = setInterval(() => {
        setCarProgress((prev) => (prev >= 95 ? 95 : prev + 3));
      }, 600);
    } else if (status === 'COMPLETED') {
      setCarProgress(100);
    } else {
      setCarProgress(0);
    }

    return () => clearInterval(interval);
  }, [status]);

  // Map locations to SVG coordinates on Dakhla peninsula
  const getCoordinates = (loc?: LocationPoint, defaultCoord = { x: 140, y: 170 }) => {
    if (!loc) return defaultCoord;
    switch (loc.id) {
      case 'loc_aeroport':
        return { x: 120, y: 165 };
      case 'loc_centre_ville':
        return { x: 100, y: 195 };
      case 'loc_pk25_lagune':
        return { x: 300, y: 110 };
      case 'loc_dakhla_attitude':
        return { x: 350, y: 80 };
      case 'loc_dune_blanche':
        return { x: 230, y: 95 };
      case 'loc_port_atlantique':
        return { x: 80, y: 220 };
      case 'loc_corniche':
        return { x: 130, y: 190 };
      default:
        return defaultCoord;
    }
  };

  const p1 = getCoordinates(origin, { x: 120, y: 165 });
  const p2 = getCoordinates(destination, { x: 300, y: 110 });

  // Compute bezier control point
  const ctrl = {
    x: Math.round((p1.x + p2.x) / 2 + (p1.y > p2.y ? 30 : -30)),
    y: Math.round((p1.y + p2.y) / 2 - 20),
  };

  // Compute animated vehicle current position on bezier route
  const t = Math.min(1, Math.max(0, carProgress / 100));
  const carX = Math.round((1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * ctrl.x + t * t * p2.x);
  const carY = Math.round((1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * ctrl.y + t * t * p2.y);

  // Vehicle Icon / Badge
  const getVehicleBadge = (type: VehicleType) => {
    switch (type) {
      case 'BUS':
        return { label: 'Minibus / Navette', color: '#38bdf8', icon: 'Bus' };
      case 'MOTO':
        return { label: 'Moto Express', color: '#a855f7', icon: 'Moto' };
      case 'TRIPORTEUR':
        return { label: 'Triporteur Éco', color: '#10b981', icon: 'Triporteur' };
      case 'VOITURE':
      default:
        return { label: 'Voiture Berline', color: '#f59e0b', icon: 'Voiture' };
    }
  };

  const vBadge = getVehicleBadge(vehicleType);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner select-none">
      {/* SVG Vector Map of Dakhla Bay / Peninsula & Road Network */}
      <svg
        viewBox="0 0 460 260"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Water gradient: Atlantic & Lagoon */}
          <linearGradient id="dakhlaWaterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#042f2e" />
            <stop offset="50%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Route path gradient */}
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Radar ripple filter */}
          <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean Background */}
        <rect width="460" height="260" fill="url(#dakhlaWaterGrad)" />

        {/* Mainland Morocco Coastline */}
        <path
          d="M 220,0 L 460,0 L 460,260 L 320,260 Q 300,180 280,120 T 240,40 Z"
          fill="#1e293b"
          opacity="0.95"
        />

        {/* Dakhla Peninsula Sand spit */}
        <path
          d="M 20,260 Q 50,220 90,190 T 130,150 T 260,110 T 370,60 L 390,75 Q 280,130 180,180 T 60,260 Z"
          fill="#334155"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Dakhla Bay / Lagune water highlights */}
        <path
          d="M 120,260 Q 180,180 270,140 T 360,85"
          fill="none"
          stroke="#0284c7"
          strokeWidth="3.5"
          opacity="0.35"
        />

        {/* Highway / National Road 1 (RN1 - Route Dakhla Lagune PK25) */}
        <path
          d="M 70,240 Q 120,180 200,150 T 320,95 T 390,70"
          fill="none"
          stroke="#1e293b"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 70,240 Q 120,180 200,150 T 320,95 T 390,70"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.5"
          strokeDasharray="4 6"
        />

        {/* Coastal secondary roads */}
        <path
          d="M 90,200 Q 140,210 210,180"
          fill="none"
          stroke="#475569"
          strokeWidth="2.5"
        />

        {/* Dune Blanche & Dragon Island desert track */}
        <path
          d="M 200,150 Q 230,120 250,95"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Key Points of Interest across Dakhla */}
        {DAKHLA_LOCATIONS.map((loc) => {
          const coords = getCoordinates(loc);
          const isOrigin = origin?.id === loc.id;
          const isDest = destination?.id === loc.id;
          return (
            <g
              key={loc.id}
              transform={`translate(${coords.x}, ${coords.y})`}
              className="cursor-pointer group"
              onClick={() => {
                setSelectedSpotId(loc.id);
                if (onSelectDestination && !isOrigin) {
                  onSelectDestination(loc);
                }
              }}
            >
              {!isOrigin && !isDest && (
                <>
                  <circle r="4" fill="#64748b" className="group-hover:fill-amber-400 transition-colors" />
                  <circle r="8" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.4" />
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7"
                    fontFamily="monospace"
                    className="select-none group-hover:fill-white font-medium"
                  >
                    {loc.name.split(' ')[0]}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* PostGIS Search Radius during SEARCHING state */}
        {status === 'SEARCHING' && (
          <g>
            <circle
              cx={p1.x}
              cy={p1.y}
              r="70"
              fill="url(#radarPulse)"
              className="animate-ping"
              style={{ animationDuration: '2.5s' }}
            />
            <circle
              cx={p1.x}
              cy={p1.y}
              r="55"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          </g>
        )}

        {/* Active Route Path if booking/active */}
        {status !== 'IDLE' && (
          <g>
            {/* Soft route glow */}
            <path
              d={`M ${p1.x},${p1.y} Q ${ctrl.x},${ctrl.y} ${p2.x},${p2.y}`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="7"
              opacity="0.3"
            />
            {/* Active route line */}
            <path
              d={`M ${p1.x},${p1.y} Q ${ctrl.x},${ctrl.y} ${p2.x},${p2.y}`}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={status === 'IN_PROGRESS' || status === 'ACCEPTED' ? '6 4' : undefined}
            />
          </g>
        )}

        {/* Other Nearby Drivers (Multimodal PostGIS Simulation) */}
        {showOtherDrivers && (status === 'IDLE' || status === 'SEARCHING') && (
          <g>
            {/* Driver 1: Car */}
            <g transform="translate(160, 160)">
              <circle r="6" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              <circle r="2.5" fill="#10b981" />
            </g>
            {/* Driver 2: Minibus */}
            <g transform="translate(260, 125)">
              <rect x="-5" y="-5" width="10" height="10" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <circle r="2" fill="#38bdf8" />
            </g>
            {/* Driver 3: Moto */}
            <g transform="translate(100, 185)">
              <circle r="5" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
              <circle r="2" fill="#a855f7" />
            </g>
          </g>
        )}

        {/* Destination Marker */}
        <g transform={`translate(${p2.x}, ${p2.y})`}>
          <circle r="14" fill="#ef4444" opacity="0.25" />
          <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <text
            x="0"
            y="-14"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="9"
            fontWeight="bold"
            className="select-none"
          >
            {destination ? destination.name.split(' ')[0] : 'Arrivée'}
          </text>
        </g>

        {/* Origin / Pickup Marker */}
        <g transform={`translate(${p1.x}, ${p1.y})`}>
          <circle r="14" fill="#38bdf8" opacity="0.3" className="animate-pulse" />
          <circle r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <text
            x="0"
            y="20"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="9"
            fontWeight="bold"
            className="select-none"
          >
            {origin ? origin.name.split(' ')[0] : 'Départ'}
          </text>
        </g>

        {/* Active Driver Vehicle moving with Multimodal Type */}
        {(status === 'ACCEPTED' || status === 'ARRIVED' || status === 'IN_PROGRESS') && (
          <g transform={`translate(${carX}, ${carY})`}>
            <circle r="16" fill={vBadge.color} opacity="0.3" className="animate-pulse" />
            <rect
              x="-11"
              y="-11"
              width="22"
              height="22"
              rx="7"
              fill={vBadge.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Orientation indicator */}
            <polygon
              points="0,-6 6,5 -6,5"
              fill="#ffffff"
              transform="rotate(40)"
            />
          </g>
        )}
      </svg>

      {/* Floating Badges & Controls on Map */}
      <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 text-xs text-slate-300">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold text-white">Dakhla Baie & Lagune PK25</span>
        <span className="text-[10px] text-slate-400 font-mono">RN1 Coastal</span>
      </div>

      {/* Vehicle Type Pill on Map */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 text-xs font-semibold text-amber-300">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vBadge.color }} />
        <span>{vBadge.label}</span>
      </div>

      {status === 'SEARCHING' && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-amber-950/85 backdrop-blur-md rounded-xl border border-amber-600/40 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Radar PostGIS actif (Rayon 5 km autour du client)</span>
          </div>
          <span className="font-mono text-amber-400 font-semibold text-[11px]">ST_DWithin</span>
        </div>
      )}

      {(status === 'ACCEPTED' || status === 'ARRIVED') && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-sky-950/85 backdrop-blur-md rounded-xl border border-sky-600/40 text-xs text-sky-200">
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
            <span>{vBadge.label} en route vers le point de prise en charge</span>
          </div>
          <span className="font-mono text-sky-300 font-bold">~3 min</span>
        </div>
      )}

      {status === 'IN_PROGRESS' && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-emerald-950/85 backdrop-blur-md rounded-xl border border-emerald-600/40 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Trajet en cours · Direction {destination?.name || 'Destination'}</span>
          </div>
          <span className="font-mono text-emerald-300 font-bold">En direct</span>
        </div>
      )}
    </div>
  );
};
