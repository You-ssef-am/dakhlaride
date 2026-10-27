import {
  LocationPoint,
  UserProfile,
  DriverOffer,
  WalletTransaction,
  RentalItem,
  SubscriptionPlan,
  VehicleType,
  TripType,
} from '../types/ride';

export const DAKHLA_LOCATIONS: LocationPoint[] = [
  {
    id: 'loc_aeroport',
    name: 'Aéroport Dakhla (VIL)',
    address: 'Boulevard Mohammed V, Dakhla',
    lat: 23.7183,
    lng: -15.9322,
    icon: 'Plane',
    popular: true,
  },
  {
    id: 'loc_centre_ville',
    name: 'Centre-Ville & Marché Municipal',
    address: 'Place Hassan II, Dakhla Centre',
    lat: 23.7088,
    lng: -15.9351,
    icon: 'Building2',
    popular: true,
  },
  {
    id: 'loc_pk25_lagune',
    name: 'PK25 - Lagune & Kitesurf Paradise',
    address: 'Route Nationale 1, Km 25 Lagune',
    lat: 23.8920,
    lng: -15.8240,
    icon: 'Waves',
    popular: true,
  },
  {
    id: 'loc_port_atlantique',
    name: 'Port Atlantique de Dakhla',
    address: 'Zone Portuaire Maritime, Dakhla',
    lat: 23.6980,
    lng: -15.9410,
    icon: 'Anchor',
    popular: false,
  },
  {
    id: 'loc_dakhla_attitude',
    name: 'Dakhla Attitude Eco-Resort',
    address: 'Pointe du Dragon, Lagune Nord',
    lat: 23.9140,
    lng: -15.8020,
    icon: 'Sun',
    popular: true,
  },
  {
    id: 'loc_dune_blanche',
    name: 'La Dune Blanche (Spot Safari)',
    address: 'Baie Ouest des Flamants Roses',
    lat: 23.7850,
    lng: -15.7950,
    icon: 'Compass',
    popular: false,
  },
  {
    id: 'loc_corniche',
    name: 'Corniche Baie de Dakhla',
    address: 'Avenue de la Corniche Maritime',
    lat: 23.7150,
    lng: -15.9280,
    icon: 'Navigation',
    popular: true,
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'usr_pass_001',
  email: 'dakhlaride@gmail.com',
  phoneNumber: '+212 6 61 23 45 67',
  fullName: 'Karim Bennani',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  rating: 4.92,
  currentRole: 'PASSENGER',
  kycStatus: 'APPROVED',
  isOnline: true,
  totalRides: 42,
  authProvider: 'GOOGLE',
  pointsBalance: 240, // 240 Points = 240 MAD
  isPassJeunes: true,
  subscription: {
    planId: 'sub_jeunes',
    planName: 'Pass Jeunes & Étudiants Dakhla',
    status: 'ACTIVE',
    expiresAt: '30 Nov 2026',
    discountPct: 50,
    autoRenew: true,
  },
};

export const INITIAL_DRIVER_USER: UserProfile = {
  id: 'usr_drv_001',
  email: 'yassine.driver.dakhla@gmail.com',
  phoneNumber: '+212 6 72 88 99 00',
  fullName: 'Yassine El Amrani',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  cinNumber: 'OD-78921',
  cinRectoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  cinVersoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  rating: 4.96,
  currentRole: 'DRIVER',
  kycStatus: 'APPROVED',
  isOnline: true,
  totalRides: 388,
  authProvider: 'GOOGLE',
  pointsBalance: 0,
  // Moroccan 24-digit RIB
  bankRib: '230 780 4561234567890123 45',
  bankName: 'Attijariwafa Bank - Agence Dakhla Oued Ed-Dahab',
  bankAccountHolder: 'Yassine El Amrani',
};

// Competing drivers with multimodal vehicles (Voiture, Bus, Moto, Triporteur)
export const MOCK_COMPETING_DRIVERS: DriverOffer[] = [
  {
    id: 'off_001',
    rideId: '',
    driverId: 'drv_omar',
    driverName: 'Omar Tazi',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    driverRating: 4.88,
    totalTrips: 520,
    vehicle: {
      id: 'veh_01',
      driverId: 'drv_omar',
      type: 'VOITURE',
      make: 'Dacia',
      model: 'Logan Berline',
      color: 'Gris Métallisé',
      licensePlate: '12-A-89452',
      year: 2023,
      isActive: true,
      maxPassengers: 4,
    },
    offeredPrice: 35,
    originalPrice: 35,
    etaMinutes: 4,
    status: 'PENDING',
    createdAt: Date.now() - 12000,
    distanceKm: 1.2,
  },
  {
    id: 'off_002',
    rideId: '',
    driverId: 'drv_tarik',
    driverName: 'Tarik Mansouri',
    driverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    driverRating: 4.95,
    totalTrips: 840,
    vehicle: {
      id: 'veh_02',
      driverId: 'drv_tarik',
      type: 'BUS',
      make: 'Mercedes-Benz',
      model: 'Sprinter Minibus Navette',
      color: 'Blanc & Lignes Bleues',
      licensePlate: '1-B-34190',
      year: 2024,
      isActive: true,
      maxPassengers: 14,
    },
    offeredPrice: 15, // Discounted pooled/bus fare
    originalPrice: 20,
    etaMinutes: 6,
    status: 'COUNTERED',
    createdAt: Date.now() - 8000,
    distanceKm: 0.8,
  },
  {
    id: 'off_003',
    driverId: 'drv_mustapha',
    rideId: '',
    driverName: 'Mustapha Zaim (Express Moto)',
    driverAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    driverRating: 4.82,
    totalTrips: 310,
    vehicle: {
      id: 'veh_03',
      driverId: 'drv_mustapha',
      type: 'MOTO',
      make: 'Yamaha',
      model: 'TMAX 560 (Casque Fourni)',
      color: 'Noir Mat',
      licensePlate: '26-D-76123',
      year: 2023,
      isActive: true,
      maxPassengers: 1,
    },
    offeredPrice: 22,
    originalPrice: 35,
    etaMinutes: 2,
    status: 'COUNTERED',
    createdAt: Date.now() - 3000,
    distanceKm: 0.5,
  },
  {
    id: 'off_004',
    driverId: 'drv_hassan',
    rideId: '',
    driverName: 'Hassan Belhaj (Triporteur)',
    driverAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    driverRating: 4.79,
    totalTrips: 640,
    vehicle: {
      id: 'veh_04',
      driverId: 'drv_hassan',
      type: 'TRIPORTEUR',
      make: 'Dokker T3',
      model: 'Triporteur Éco & Bagages',
      color: 'Bleu Royal',
      licensePlate: '12-E-10923',
      year: 2022,
      isActive: true,
      maxPassengers: 2,
    },
    offeredPrice: 18,
    originalPrice: 35,
    etaMinutes: 5,
    status: 'PENDING',
    createdAt: Date.now() - 5000,
    distanceKm: 1.1,
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_01',
    userId: 'usr_drv_001',
    rideId: 'ride_hist_892',
    amount: 55.00,
    type: 'RIDE_EARNING',
    description: 'Course Aéroport Dakhla -> Hôtel Dakhla Club',
    balanceAfter: 485.50,
    date: '26 Oct 2026, 09:15',
  },
  {
    id: 'tx_02',
    userId: 'usr_drv_001',
    rideId: 'ride_hist_892',
    amount: -8.25,
    type: 'PLATFORM_FEE',
    description: 'Commission plateforme 15% (Course #892)',
    balanceAfter: 477.25,
    date: '26 Oct 2026, 09:15',
  },
  {
    id: 'tx_03',
    userId: 'usr_drv_001',
    amount: -250.00,
    type: 'DRIVER_PAYOUT',
    description: 'Virement bancaire (Attijariwafa Bank)',
    balanceAfter: 227.25,
    date: '25 Oct 2026, 17:40',
  },
  {
    id: 'tx_04',
    userId: 'usr_drv_001',
    rideId: 'ride_hist_890',
    amount: 40.00,
    type: 'RIDE_EARNING',
    description: 'Course Centre-Ville -> PK25 Lagune',
    balanceAfter: 477.25,
    date: '25 Oct 2026, 14:10',
  },
];

// Multimodal fare calculation engine
export function calculateMultimodalFare(
  distanceKm: number,
  durationMinutes: number,
  vehicleType: VehicleType = 'VOITURE',
  tripType: TripType = 'SOLO'
): number {
  // Base fare: 15 MAD + 3.5 MAD/km + 0.5 MAD/min
  const base = 15;
  const kmFare = distanceKm * 3.5;
  const timeFare = durationMinutes * 0.5;
  let raw = base + kmFare + timeFare;

  // Multimodal coefficients
  switch (vehicleType) {
    case 'MOTO':
      raw *= 0.65; // -35% faster solo ride
      break;
    case 'TRIPORTEUR':
      raw *= 0.55; // -45% budget short trips / equipment
      break;
    case 'BUS':
      raw *= 0.40; // -60% public shuttle route per passenger
      break;
    case 'VOITURE':
    default:
      // Standard car
      break;
  }

  // Shared ride discount (Course Partagée)
  if (tripType === 'SHARED') {
    raw *= 0.60; // 40% discount for sharing seats
  }

  // Round to nearest multiple of 5 MAD
  return Math.max(10, Math.round(raw / 5) * 5);
}

export function calculateFare(distanceKm: number, durationMinutes: number): number {
  return calculateMultimodalFare(distanceKm, durationMinutes, 'VOITURE', 'SOLO');
}

// Tourism & Gear Rental Catalog in Dakhla
export const RENTAL_ITEMS: RentalItem[] = [
  {
    id: 'gear_gopro12',
    title: 'Pack GoPro Hero 12 Black + Caisson Étanche 60m',
    category: 'CAMERA',
    categoryLabel: 'Caméras & Action Cams',
    description: 'Capture 5.3K 60fps avec stabilisation HyperSmooth 6.0, perche télescopique flottante, 3 batteries Enduro et harnais kitesurf.',
    hourlyRate: 40,
    dailyRate: 180,
    depositAmount: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Centre-Ville Dakhla ou Livraison Spot PK25',
    availableQuantity: 6,
    specs: ['5.3K Ultra HD', 'Étanche 60m', '3x Batteries Enduro', 'Fixation Harnais'],
    rating: 4.96,
    reviewsCount: 78,
    isPopular: true,
  },
  {
    id: 'gear_kite_pack',
    title: 'Pack Kitesurf Complet Duotone Rebel / Neo SLS',
    category: 'KITESURF',
    categoryLabel: 'Kitesurf & Ailes',
    description: 'Aile haute performance (taille au choix : 8m, 10m ou 12m), barre Click Bar Quad Control, planche Twin-Tip Select et pompe.',
    hourlyRate: 90,
    dailyRate: 390,
    depositAmount: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Spot PK25 Lagune (Kite Club)',
    availableQuantity: 12,
    specs: ['Tailles 8m à 12m', 'Barre ClickBar 2024', 'Planche TwinTip Carbon', 'Harnais Mystic inclus'],
    rating: 4.98,
    reviewsCount: 142,
    isPopular: true,
  },
  {
    id: 'gear_wingfoil',
    title: 'Pack Wing Foil F-One Strike + Board Rocket Wing',
    category: 'WING_FOIL',
    categoryLabel: 'Wing & Foil',
    description: 'Aile Wing 5m² F-One, foil hydrofoil carbone haute portance et planche gonflable ultra stable idéale pour les thermiques de la lagune.',
    hourlyRate: 80,
    dailyRate: 350,
    depositAmount: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Spot Dakhla Attitude (Dragon Island)',
    availableQuantity: 5,
    specs: ['Aile 5.0m²', 'Mast Carbone 85cm', 'Board 110L', 'Leash poignet & cheville'],
    rating: 4.91,
    reviewsCount: 45,
    isPopular: true,
  },
  {
    id: 'gear_quad_safari',
    title: 'Quad Tout-Terrain 4x4 Yamaha 450cc Safari',
    category: 'SAFARI_QUAD',
    categoryLabel: 'Quads & Buggy Désert',
    description: 'Quad puissant homologué pour les pistes de sable, excursions vers la Dune Blanche et raid le long de la côte atlantique. Casque et gants inclus.',
    hourlyRate: 150,
    dailyRate: 650,
    depositAmount: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Base Safari Ouest (Avenue Mohammed V)',
    availableQuantity: 8,
    specs: ['Moteur 450cc 4-Temps', 'Transmission 4x4', 'GPS Inclus', 'Casque + Lunettes anti-sable'],
    rating: 4.89,
    reviewsCount: 64,
  },
  {
    id: 'gear_fatbike',
    title: 'Fatbike Électrique Tout-Chemin Plage & Désert',
    category: 'EBIKE',
    categoryLabel: 'Vélos & Fatbikes',
    description: 'Pneus ultra larges 4.0 pouces pour rouler sur le sable mouillé de la lagune sans effort. Moteur 500W et autonomie de 70 km.',
    hourlyRate: 35,
    dailyRate: 150,
    depositAmount: 800,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Corniche de Dakhla (Face à la Baie)',
    availableQuantity: 10,
    specs: ['Autonomie 70km', 'Pneus Fat 26x4.0', 'Support Smartphone', 'Antivol haute sécurité'],
    rating: 4.87,
    reviewsCount: 39,
  },
  {
    id: 'gear_wetsuit',
    title: 'Pack Néoprène Rip Curl 4/3mm + Gilet Impact',
    category: 'WATERSPORTS',
    categoryLabel: 'Combinaisons & Protection',
    description: 'Combinaison thermique souple Flashbomb 4/3mm, chaussons néoprène et gilet de flottaison haute sécurité certifié CE.',
    hourlyRate: 20,
    dailyRate: 80,
    depositAmount: 400,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    pickupSpot: 'Toutes les agences & Clubs partenaires',
    availableQuantity: 25,
    specs: ['Néoprène Superstretch', 'Toutes tailles (XS à XXL)', 'Gilet d\'impact 50N', 'Chaussons inclus'],
    rating: 4.94,
    reviewsCount: 92,
  },
];

// Subscriptions & Pass Jeunes Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub_jeunes',
    title: 'Pass Jeunes & Étudiants Dakhla',
    badge: '-50% Transport',
    priceMAD: 99,
    period: 'MONTHLY',
    targetAudience: 'Moins de 26 ans & Étudiants',
    discountRate: 0.50,
    colorScheme: 'amber',
    popular: true,
    perks: [
      '50% de réduction sur toutes les courses partagées & minibus',
      'Accès prioritaire aux navettes étudiant & lycées',
      'Portefeuille Points sans frais de rechargement',
      'Réservation express en 1 clic',
    ],
  },
  {
    id: 'sub_resident',
    title: 'Pass Résident Navette Quotidienne',
    badge: 'Illimité & Éco',
    priceMAD: 199,
    period: 'MONTHLY',
    targetAudience: 'Résidents réguliers & Travailleurs',
    discountRate: 0.35,
    colorScheme: 'emerald',
    perks: [
      'Courses urbaines quotidiennes à tarif préférentiel fixe',
      '35% de réduction sur toutes les courses individuelles',
      'Prise en charge prioritaire aux heures de pointe',
      'Support WhatsApp dédié 7j/7',
    ],
  },
  {
    id: 'sub_kitesurf',
    title: 'Pass Kitesurf & Lagune PK25',
    badge: 'Spot Illimité',
    priceMAD: 349,
    period: 'MONTHLY',
    targetAudience: 'Riders, Kitesurfeurs & Nomades',
    discountRate: 0.40,
    colorScheme: 'indigo',
    perks: [
      'Navettes quotidiennes aller-retour Centre-Ville ↔ PK25',
      'Transport gratuit des boardbags volumineux',
      '-25% sur toute la location de matériel (GoPro, Wing, Foil)',
      'Alertes météo et vent temps réel sur votre mobile',
    ],
  },
  {
    id: 'sub_annual_nomad',
    title: 'Pass Annuel Dakhla VIP Unlimited',
    badge: 'Pack Annuel VIP',
    priceMAD: 1490,
    period: 'ANNUAL',
    targetAudience: 'Nomades digitaux & Amoureux de Dakhla',
    discountRate: 0.50,
    colorScheme: 'purple',
    perks: [
      '12 mois complets avec 50% de réduction permanente',
      'Transferts aéroport VIL illimités et prioritaires',
      '2 journées de location GoPro 4K offertes chaque mois',
      'Accès exclusif aux événements & safaris Dune Blanche',
    ],
  },
];
