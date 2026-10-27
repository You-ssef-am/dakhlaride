export type UserRole = 'PASSENGER' | 'DRIVER';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type RideStatus =
  | 'IDLE'
  | 'SEARCHING'       // Passenger requested ride, awaiting driver offers
  | 'OFFERS_RECEIVED' // Drivers submitted offers/counter-proposals
  | 'ACCEPTED'        // Passenger selected a driver, driver en route to pickup
  | 'ARRIVED'         // Driver arrived at pickup, awaiting OTP
  | 'IN_PROGRESS'     // OTP validated, ride underway to destination
  | 'COMPLETED'       // Reached destination, paid
  | 'CANCELLED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'COUNTERED';

// Multimodal Transport Types
export type VehicleType = 'VOITURE' | 'BUS' | 'MOTO' | 'TRIPORTEUR';
export type TripType = 'SOLO' | 'SHARED'; // Course Seule vs Course Partagée

export interface LocationPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon?: string;
  popular?: boolean;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED';
  expiresAt: string;
  discountPct: number;
  autoRenew: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl: string;
  driverPhotoUrl?: string;
  cinNumber?: string;
  cinRectoUrl?: string;
  cinVersoUrl?: string;
  rating: number;
  currentRole: UserRole;
  kycStatus: KycStatus;
  isOnline: boolean;
  totalRides: number;
  authProvider?: 'GOOGLE' | 'PHONE';
  // Point system (1 point = 1 MAD)
  pointsBalance: number;
  // Driver banking details (RIB)
  bankRib?: string;
  bankName?: string;
  bankAccountHolder?: string;
  // Subscriptions & Youth Pass
  subscription?: UserSubscription;
  isPassJeunes?: boolean;
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
  photoUrl?: string;
  registrationDocUrl?: string;
  insuranceDocUrl?: string;
  licenseDocUrl?: string;
  cinRectoUrl?: string;
  cinVersoUrl?: string;
  isActive: boolean;
  maxPassengers?: number;
}

export type PaymentMethod = 'POINTS' | 'CASH';

export interface DriverOffer {
  id: string;
  rideId: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  totalTrips: number;
  vehicle: Vehicle;
  offeredPrice: number;
  originalPrice: number;
  etaMinutes: number;
  status: OfferStatus;
  createdAt: number;
  distanceKm: number;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerRating: number;
  origin: LocationPoint;
  destination: LocationPoint;
  recommendedPrice: number;
  passengerPrice: number;
  finalPrice?: number;
  status: RideStatus;
  otpCode: string;
  distanceKm: number;
  durationMinutes: number;
  paymentMethod: PaymentMethod;
  // Multimodal options
  vehicleType: VehicleType;
  tripType: TripType;
  seatsBooked?: number;
  sharedDiscountApplied?: boolean;
  selectedOfferId?: string;
  driverConfirmedCompletion?: boolean;
  passengerConfirmedCompletion?: boolean;
  passengerRatingGiven?: number;
  driver?: {
    id: string;
    name: string;
    rating: number;
    phone: string;
    avatar: string;
    vehicle: Vehicle;
  };
  createdAt: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  rideId?: string;
  amount: number;
  type: 'PLATFORM_FEE' | 'DRIVER_PAYOUT' | 'RIDE_EARNING' | 'TOPUP' | 'SUBSCRIPTION' | 'RENTAL';
  description: string;
  balanceAfter: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface WebSocketLogEvent {
  id: string;
  event: string;
  correlationId: string;
  timestamp: number;
  sender: 'PASSENGER' | 'DRIVER' | 'SERVER';
  summary: string;
  payload: Record<string, any>;
}

// Tourism & Gear Rental Types
export type GearCategory = 'KITESURF' | 'CAMERA' | 'WING_FOIL' | 'WATERSPORTS' | 'SAFARI_QUAD' | 'EBIKE';
export type RentalDurationUnit = 'HOURLY' | 'DAILY';

export interface RentalItem {
  id: string;
  title: string;
  category: GearCategory;
  categoryLabel: string;
  description: string;
  hourlyRate: number; // In MAD / Points
  dailyRate: number;  // In MAD / Points
  depositAmount: number;
  imageUrl: string;
  pickupSpot: string;
  availableQuantity: number;
  specs: string[];
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
}

export interface RentalBooking {
  id: string;
  userId: string;
  userName: string;
  gearId: string;
  gearTitle: string;
  durationUnit: RentalDurationUnit;
  durationValue: number;
  totalPrice: number;
  pickupLocation: string;
  paymentMethod: PaymentMethod;
  status: 'CONFIRMED' | 'ACTIVE' | 'RETURNED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: number;
}

// Subscriptions & Pass Jeunes
export interface SubscriptionPlan {
  id: string;
  title: string;
  badge: string;
  priceMAD: number;
  period: 'MONTHLY' | 'ANNUAL';
  targetAudience: string;
  discountRate: number; // e.g. 0.50 = 50% discount
  perks: string[];
  popular?: boolean;
  colorScheme: 'amber' | 'emerald' | 'indigo' | 'purple';
}
