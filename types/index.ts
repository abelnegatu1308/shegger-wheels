export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: ('renter' | 'owner' | 'admin')[];
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Car {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  transmission: 'Manual' | 'Automatic';
  seats: number;
  city: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
  pricePerDay: number;
  photos: string[];
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'inactive';
  unavailableDates: string[]; // ISO date strings YYYY-MM-DD
  createdAt: string;
}

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'reviewed'
  | 'declined'
  | 'cancelled'
  | 'disputed'
  | 'resolved';

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  pricePerDay: number;
  subtotal: number;
  fee: number;
  total: number;
  paymentStatus: 'pending' | 'paid_telebirr' | 'held' | 'refunded';
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  rating: number; // 1-5
  comment: string;
  ownerReply?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  openedBy: string; // userId
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  resolutionNotes?: string;
  ownerResponse?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SessionState {
  userId: string;
  activeRole: UserRole;
}

export type UserRole = 'renter' | 'owner' | 'admin';

export interface CheckoutDraft {
  carId: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  subtotal: number;
  fee: number;
  total: number;
}
