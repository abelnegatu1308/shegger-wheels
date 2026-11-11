import { User, Car, Booking, Review, Dispute, Announcement, SessionState, UserRole, CheckoutDraft } from '@/types';

export const STORAGE_KEYS = {
  USERS: 'sw_users_v1',
  CARS: 'sw_cars_v1',
  BOOKINGS: 'sw_bookings_v1',
  REVIEWS: 'sw_reviews_v1',
  DISPUTES: 'sw_disputes_v1',
  ANNOUNCEMENTS: 'sw_announcements_v1',
  SESSION: 'sw_session_v1',
  CHECKOUT_DRAFT: 'sw_checkout_draft_v1',
};

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

function readCollection<T>(key: string, fallback: T[]): T[] {
  const value = readStorage<unknown>(key, fallback);
  if (Array.isArray(value) && value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
    return value as T[];
  }
  console.error(`Invalid collection in localStorage key "${key}". Using demo defaults.`);
  return fallback;
}

export function writeStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new Event('sw_storage_update'));
    return true;
  } catch (e) {
    console.error(`Error writing localStorage key "${key}":`, e);
    return false;
  }
}

// SessionStorage helpers
export function readSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading sessionStorage key "${key}":`, e);
    return fallback;
  }
}

export function writeSession<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error writing sessionStorage key "${key}":`, e);
    return false;
  }
}

// Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'u_admin_1',
    name: 'Abebe Admin',
    email: 'admin@sheggerwheels.et',
    phone: '+251911223344',
    roles: ['admin', 'renter'],
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u_owner_1',
    name: 'Dawit Kebede (Fleet Owner)',
    email: 'dawit@sheggerwheels.et',
    phone: '+251922334455',
    roles: ['owner', 'renter'],
    status: 'active',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'u_renter_1',
    name: 'Tigist Mamo (Renter)',
    email: 'tigist@sheggerwheels.et',
    phone: '+251933445566',
    roles: ['renter'],
    status: 'active',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'u_owner_2',
    name: 'Mekdes Tadesse (Owner)',
    email: 'mekdes@sheggerwheels.et',
    phone: '+251944556677',
    roles: ['owner', 'renter'],
    status: 'active',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

const INITIAL_CARS: Car[] = [
  {
    id: 'car_1',
    ownerId: 'u_owner_1',
    make: 'Toyota',
    model: 'Corolla EX',
    year: 2021,
    transmission: 'Automatic',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'Bole',
    latitude: 8.9806,
    longitude: 38.7578,
    pricePerDay: 2500,
    photos: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Extremely clean and well-maintained Toyota Corolla EX. Perfect for city driving and comfortable trips around Addis Ababa. AC and Bluetooth fully functional.',
    status: 'approved',
    unavailableDates: ['2026-11-01', '2026-11-02'],
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'car_2',
    ownerId: 'u_owner_1',
    make: 'Hyundai',
    model: 'Tucson SUV',
    year: 2022,
    transmission: 'Automatic',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'Kazanchis',
    latitude: 9.0108,
    longitude: 38.7612,
    pricePerDay: 4200,
    photos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Spacious modern SUV with excellent ground clearance. Ideal for family outings and weekend getaways outside the city.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-01-12T11:00:00.000Z',
  },
  {
    id: 'car_3',
    ownerId: 'u_owner_1',
    make: 'Toyota',
    model: 'Vitz hatchback',
    year: 2019,
    transmission: 'Automatic',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'Piassa',
    latitude: 9.0300,
    longitude: 38.7400,
    pricePerDay: 1800,
    photos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c351?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fuel-efficient and nimble compact car. Great for narrow streets and parking in busy areas.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'car_4',
    ownerId: 'u_owner_2',
    make: 'Ford',
    model: 'Ranger Double Cab',
    year: 2023,
    transmission: 'Manual',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'CMC',
    latitude: 9.0227,
    longitude: 38.8210,
    pricePerDay: 5500,
    photos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Rugged 4x4 pickup truck. Built for tough terrain and heavy hauling.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-01-18T14:00:00.000Z',
  },
  {
    id: 'car_5',
    ownerId: 'u_owner_2',
    make: 'Suzuki',
    model: 'Dzire Sedan',
    year: 2021,
    transmission: 'Manual',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'Sarbet',
    latitude: 8.9900,
    longitude: 38.7300,
    pricePerDay: 2000,
    photos: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Comfortable sedan with great fuel economy and ample boot space.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-01-20T16:00:00.000Z',
  },
  {
    id: 'car_6',
    ownerId: 'u_owner_2',
    make: 'Toyota',
    model: 'Land Cruiser V8',
    year: 2022,
    transmission: 'Automatic',
    seats: 7,
    city: 'Addis Ababa',
    neighbourhood: 'Bole Atlas',
    latitude: 8.9950,
    longitude: 38.7800,
    pricePerDay: 9000,
    photos: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultimate luxury and power. 7-seater V8 Land Cruiser for VIP travel and extreme comfort.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-01-22T08:00:00.000Z',
  },
  {
    id: 'car_7',
    ownerId: 'u_owner_1',
    make: 'Kia',
    model: 'Rio',
    year: 2020,
    transmission: 'Automatic',
    seats: 5,
    city: 'Addis Ababa',
    neighbourhood: 'Ayat',
    latitude: 9.0350,
    longitude: 38.8500,
    pricePerDay: 2200,
    photos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c351?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Stylish, smooth driving hatchback with modern infotainment system.',
    status: 'pending',
    unavailableDates: [],
    createdAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'car_8',
    ownerId: 'u_owner_2',
    make: 'Nissan',
    model: 'Patrol',
    year: 2018,
    transmission: 'Automatic',
    seats: 7,
    city: 'Addis Ababa',
    neighbourhood: 'Old Airport',
    latitude: 8.9850,
    longitude: 38.7450,
    pricePerDay: 7500,
    photos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Powerful full-size luxury SUV.',
    status: 'approved',
    unavailableDates: [],
    createdAt: '2026-02-03T10:00:00.000Z',
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_1',
    carId: 'car_1',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_1',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    days: 3,
    pricePerDay: 2500,
    subtotal: 7500,
    fee: 375,
    total: 7875,
    paymentStatus: 'paid_telebirr',
    status: 'confirmed',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:05:00.000Z',
  },
  {
    id: 'bk_2',
    carId: 'car_2',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_1',
    startDate: '2026-09-10',
    endDate: '2026-09-13',
    days: 3,
    pricePerDay: 4200,
    subtotal: 12600,
    fee: 630,
    total: 13230,
    paymentStatus: 'paid_telebirr',
    status: 'completed',
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-13T18:00:00.000Z',
  },
  {
    id: 'bk_3',
    carId: 'car_3',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_1',
    startDate: '2026-10-30',
    endDate: '2026-11-01',
    days: 2,
    pricePerDay: 1800,
    subtotal: 3600,
    fee: 180,
    total: 3780,
    paymentStatus: 'held',
    status: 'requested',
    createdAt: '2026-10-21T12:00:00.000Z',
    updatedAt: '2026-10-21T12:00:00.000Z',
  },
  {
    id: 'bk_4',
    carId: 'car_5',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_2',
    startDate: '2026-10-18',
    endDate: '2026-10-20',
    days: 2,
    pricePerDay: 2000,
    subtotal: 4000,
    fee: 200,
    total: 4200,
    paymentStatus: 'refunded',
    status: 'cancelled',
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-11T12:00:00.000Z',
  },
  {
    id: 'bk_5',
    carId: 'car_8',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_2',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    days: 2,
    pricePerDay: 7500,
    subtotal: 15000,
    fee: 750,
    total: 15750,
    paymentStatus: 'paid_telebirr',
    status: 'in_progress',
    createdAt: '2026-10-20T16:00:00.000Z',
    updatedAt: '2026-10-22T07:00:00.000Z',
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    bookingId: 'bk_2',
    carId: 'car_2',
    renterId: 'u_renter_1',
    ownerId: 'u_owner_1',
    rating: 5,
    comment: 'Amazing Tucson SUV! Owner Dawit was very punctual and helpful. Highly recommended.',
    ownerReply: 'Thank you Tigist! You were a wonderful guest.',
    createdAt: '2026-09-14T10:00:00.000Z',
  }
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'dsp_1',
    bookingId: 'bk_2',
    openedBy: 'u_renter_1',
    reason: 'Minor scratch discussion',
    description: 'We had a brief discussion about a small bumper scuff, but resolved it amicably.',
    status: 'resolved',
    resolutionNotes: 'Inspected by owner and renter. Normal wear and tear accepted.',
    resolvedBy: 'u_admin_1',
    createdAt: '2026-09-13T20:00:00.000Z',
    resolvedAt: '2026-09-14T08:00:00.000Z',
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Welcome to Sheggar Wheels!',
    message: 'Explore peer-to-peer car rentals across Addis Ababa with secure TeleBirr simulation payments.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'u_admin_1',
  }
];

export function initializeDemoData(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    if (!localStorage.getItem(STORAGE_KEYS.CARS)) localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(INITIAL_CARS));
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    if (!localStorage.getItem(STORAGE_KEYS.DISPUTES)) localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(INITIAL_DISPUTES));
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  } catch (error) {
    console.error('Unable to initialize Sheggar Wheels demo storage:', error);
  }
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(INITIAL_CARS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(INITIAL_DISPUTES));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.CHECKOUT_DRAFT);
  window.location.reload();
}

// Data Access Helpers
export function getUsers(): User[] {
  initializeDemoData();
  return readCollection<User>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUsers(users: User[]): boolean {
  return writeStorage(STORAGE_KEYS.USERS, users);
}

export function getCars(): Car[] {
  initializeDemoData();
  return readCollection<Car>(STORAGE_KEYS.CARS, INITIAL_CARS);
}

export function getPublicCars(): Car[] {
  const activeOwners = new Set(getUsers().filter((user) => user.status === 'active' && Array.isArray(user.roles) && user.roles.includes('owner')).map((user) => user.id));
  return getCars().filter((car) => car.status === 'approved' && activeOwners.has(car.ownerId));
}

export function saveCars(cars: Car[]): boolean {
  return writeStorage(STORAGE_KEYS.CARS, cars);
}

export function getBookings(): Booking[] {
  initializeDemoData();
  return readCollection<Booking>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export function saveBookings(bookings: Booking[]): boolean {
  return writeStorage(STORAGE_KEYS.BOOKINGS, bookings);
}

export function getReviews(): Review[] {
  initializeDemoData();
  return readCollection<Review>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function saveReviews(reviews: Review[]): boolean {
  return writeStorage(STORAGE_KEYS.REVIEWS, reviews);
}

export function getDisputes(): Dispute[] {
  initializeDemoData();
  return readCollection<Dispute>(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
}

export function saveDisputes(disputes: Dispute[]): boolean {
  return writeStorage(STORAGE_KEYS.DISPUTES, disputes);
}

export function getAnnouncements(): Announcement[] {
  initializeDemoData();
  return readCollection<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
}

export function saveAnnouncements(announcements: Announcement[]): boolean {
  return writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
}

// Session Helpers
export function getCurrentSession(): SessionState | null {
  const session = readSession<SessionState | null>(STORAGE_KEYS.SESSION, null);
  if (
    !session ||
    typeof session.userId !== 'string' ||
    !['renter', 'owner', 'admin'].includes(session.activeRole)
  ) return null;
  const user = getUsers().find((candidate) => candidate.id === session.userId);
  return user?.status === 'active' && Array.isArray(user.roles) && user.roles.includes(session.activeRole) ? session : null;
}

export function getCurrentUser(): User | null {
  const session = getCurrentSession();
  if (!session) return null;
  const users = getUsers();
  return users.find((u) => u.id === session.userId) || null;
}

export function signInAsDemo(userId: string, role: UserRole): boolean {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || user.status !== 'active' || !Array.isArray(user.roles) || !user.roles.includes(role)) return false;
  const session: SessionState = { userId, activeRole: role };
  return writeSession(STORAGE_KEYS.SESSION, session);
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.CHECKOUT_DRAFT);
  window.location.href = '/';
}

export function formatETB(amount: number): string {
  return amount.toLocaleString('en-US') + ' ETB';
}

export function safeReturnPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /%2f|%5c/i.test(value)) {
    return fallback;
  }
  try {
    const url = new URL(value, 'https://sheggar-wheels.invalid');
    return url.origin === 'https://sheggar-wheels.invalid'
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function hasRole(user: User | null, role: UserRole): boolean {
  return Boolean(user && user.status === 'active' && Array.isArray(user.roles) && user.roles.includes(role));
}

function currentActiveUser(): User | null {
  const session = getCurrentSession();
  if (!session) return null;
  const user = getUsers().find((candidate) => candidate.id === session.userId) ?? null;
  return user?.status === 'active' ? user : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function overlaps(startDate: string, endDate: string, booking: Booking): boolean {
  return startDate < booking.endDate && endDate > booking.startDate;
}

function generateId(prefix: string): string {
  return `${prefix}_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

export type DomainResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export function createBookingRequest(draft: CheckoutDraft): DomainResult<Booking> {
  if (!draft || typeof draft !== 'object' || typeof draft.carId !== 'string' ||
    typeof draft.startDate !== 'string' || typeof draft.endDate !== 'string') {
    return { ok: false, message: 'Checkout details are missing or malformed. Please start again from a vehicle page.' };
  }
  const session = getCurrentSession();
  const user = currentActiveUser();
  if (!session || !user || !hasRole(user, 'renter')) return { ok: false, message: 'Not signed in as a renter.' };

  const car = getCars().find((candidate) => candidate.id === draft.carId && candidate.status === 'approved');
  if (!car) return { ok: false, message: 'This vehicle is no longer available for booking.' };
  const owner = getUsers().find((candidate) => candidate.id === car.ownerId);
  if (!owner || !hasRole(owner, 'owner')) return { ok: false, message: 'This vehicle owner is not currently available.' };
  if (!isValidDate(draft.startDate) || !isValidDate(draft.endDate) || draft.startDate >= draft.endDate) {
    return { ok: false, message: 'Choose valid rental dates. The end date must be after the start date.' };
  }
  if (draft.startDate <= new Date().toISOString().slice(0, 10)) {
    return { ok: false, message: 'Choose a future start date.' };
  }

  const days = (Date.parse(`${draft.endDate}T00:00:00Z`) - Date.parse(`${draft.startDate}T00:00:00Z`)) / 86_400_000;
  if (days < 1 || days !== draft.days) return { ok: false, message: 'The checkout dates have changed. Please choose them again.' };
  if (!Number.isFinite(draft.pricePerDay) || draft.pricePerDay !== car.pricePerDay) {
    return { ok: false, message: 'The listed price changed. Please review the current price.' };
  }

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(Date.parse(`${draft.startDate}T00:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
    if (car.unavailableDates.includes(date)) return { ok: false, message: `This vehicle is unavailable on ${date}.` };
  }

  const subtotal = days * car.pricePerDay;
  const fee = Math.round(subtotal * 0.05);
  if (draft.subtotal !== subtotal || draft.fee !== fee || draft.total !== subtotal + fee) {
    return { ok: false, message: 'The checkout total is invalid. Please review the booking again.' };
  }

  const bookings = getBookings();
  const hasConflict = bookings.some((booking) =>
    booking.carId === car.id &&
    ['requested', 'confirmed', 'in_progress', 'disputed'].includes(booking.status) &&
    overlaps(draft.startDate, draft.endDate, booking)
  );
  if (hasConflict) return { ok: false, message: 'Those dates overlap another active booking request.' };

  const booking: Booking = {
    id: generateId('bk'),
    carId: car.id,
    renterId: user.id,
    ownerId: car.ownerId,
    startDate: draft.startDate,
    endDate: draft.endDate,
    days,
    pricePerDay: car.pricePerDay,
    subtotal,
    fee,
    total: subtotal + fee,
    paymentStatus: 'held',
    status: 'requested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!saveBookings([...bookings, booking])) return { ok: false, message: 'Could not save the booking. Check browser storage and try again.' };
  return { ok: true, value: booking };
}

export function transitionBooking(
  bookingId: string,
  nextStatus: Booking['status'],
): DomainResult<Booking> {
  const session = getCurrentSession();
  const user = currentActiveUser();
  if (!session || !user) return { ok: false, message: 'Not signed in.' };

  const bookings = getBookings();
  const booking = bookings.find((candidate) => candidate.id === bookingId);
  if (!booking) return { ok: false, message: 'Booking not found.' };

  const isOwner = booking.ownerId === user.id && hasRole(user, 'owner');
  const isRenter = booking.renterId === user.id && hasRole(user, 'renter');
  let allowed = false;
  if (booking.status === 'requested' && nextStatus === 'confirmed' && isOwner) {
    const car = getCars().find((candidate) => candidate.id === booking.carId && candidate.status === 'approved');
    if (!car || car.ownerId !== user.id) return { ok: false, message: 'This listing is no longer active and cannot be approved.' };
    const conflict = bookings.some((candidate) =>
      candidate.id !== booking.id &&
      candidate.carId === booking.carId &&
      ['confirmed', 'in_progress', 'disputed'].includes(candidate.status) &&
      overlaps(booking.startDate, booking.endDate, candidate)
    );
    if (conflict) return { ok: false, message: 'Another booking now overlaps these dates; this request cannot be approved.' };
    allowed = true;
  } else if (booking.status === 'requested' && nextStatus === 'declined' && isOwner) {
    allowed = true;
  } else if (['requested', 'confirmed'].includes(booking.status) && nextStatus === 'cancelled' && isRenter) {
    if (booking.status === 'confirmed' && booking.startDate <= new Date().toISOString().slice(0, 10)) {
      return { ok: false, message: 'A confirmed rental can only be cancelled before its start date.' };
    }
    allowed = true;
  } else if (booking.status === 'confirmed' && nextStatus === 'in_progress' && isOwner) {
    allowed = true;
  } else if (booking.status === 'in_progress' && nextStatus === 'completed' && isOwner) {
    allowed = true;
  }

  if (!allowed) return { ok: false, message: 'That action is not allowed for your role or this booking status.' };

  const updated = { ...booking, status: nextStatus, updatedAt: new Date().toISOString() };
  if (!saveBookings(bookings.map((candidate) => candidate.id === bookingId ? updated : candidate))) {
    return { ok: false, message: 'Could not save the booking update. Check browser storage and try again.' };
  }
  return { ok: true, value: updated };
}

export function submitBookingReview(bookingId: string, rating: number, comment: string): DomainResult<Review> {
  const user = currentActiveUser();
  if (!user || !hasRole(user, 'renter')) return { ok: false, message: 'Sign in as the renter who booked this vehicle.' };
  const bookings = getBookings();
  const booking = bookings.find((candidate) => candidate.id === bookingId);
  if (!booking || booking.renterId !== user.id) return { ok: false, message: 'Not yours: this booking cannot be reviewed by this account.' };
  if (booking.status !== 'completed') return { ok: false, message: 'Only a completed trip can be reviewed.' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment.trim()) {
    return { ok: false, message: 'Choose a rating and write a review before submitting.' };
  }

  const reviews = getReviews();
  if (reviews.some((review) => review.bookingId === bookingId)) {
    return { ok: false, message: 'A review has already been submitted for this trip.' };
  }
  const review: Review = {
    id: generateId('rev'),
    bookingId,
    carId: booking.carId,
    renterId: user.id,
    ownerId: booking.ownerId,
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };
  if (!saveReviews([...reviews, review])) return { ok: false, message: 'Could not save the review. Check browser storage and try again.' };
  const updatedBooking = { ...booking, status: 'reviewed' as const, updatedAt: new Date().toISOString() };
  if (!saveBookings(bookings.map((candidate) => candidate.id === bookingId ? updatedBooking : candidate))) {
    saveReviews(reviews);
    return { ok: false, message: 'Could not update the booking status. Check browser storage and try again.' };
  }
  return { ok: true, value: review };
}

export function respondToOwnerReview(reviewId: string, response: string): DomainResult<Review> {
  const user = currentActiveUser();
  if (!user || !hasRole(user, 'owner')) return { ok: false, message: 'Sign in with an owner demo account.' };
  if (!response.trim()) return { ok: false, message: 'Write a response before submitting.' };
  const reviews = getReviews();
  const review = reviews.find((candidate) => candidate.id === reviewId);
  if (!review || review.ownerId !== user.id) return { ok: false, message: 'Not yours: this review is not for one of your vehicles.' };
  const updated = { ...review, ownerReply: response.trim() };
  if (!saveReviews(reviews.map((candidate) => candidate.id === reviewId ? updated : candidate))) {
    return { ok: false, message: 'Could not save the reply. Check browser storage and try again.' };
  }
  return { ok: true, value: updated };
}

export function openBookingDispute(bookingId: string, reason: string, description: string): DomainResult<Dispute> {
  const user = currentActiveUser();
  if (!user) return { ok: false, message: 'Not signed in.' };
  const bookings = getBookings();
  const booking = bookings.find((candidate) => candidate.id === bookingId);
  const isRenter = booking?.renterId === user.id && hasRole(user, 'renter');
  const isOwner = booking?.ownerId === user.id && hasRole(user, 'owner');
  if (!booking || (!isRenter && !isOwner)) {
    return { ok: false, message: 'Not yours: only a renter or owner on this booking may open a dispute.' };
  }
  if (!['in_progress', 'completed'].includes(booking.status)) {
    return { ok: false, message: 'A dispute can only be opened for an active or completed rental.' };
  }
  if (!reason.trim() || !description.trim()) return { ok: false, message: 'Choose a reason and describe the issue.' };
  const disputes = getDisputes();
  if (disputes.some((dispute) => dispute.bookingId === bookingId && dispute.status !== 'resolved')) {
    return { ok: false, message: 'An unresolved dispute already exists for this booking.' };
  }

  const dispute: Dispute = {
    id: generateId('dsp'),
    bookingId,
    openedBy: user.id,
    reason: reason.trim(),
    description: description.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  if (!saveDisputes([...disputes, dispute])) return { ok: false, message: 'Could not save the dispute. Check browser storage and try again.' };
  if (!saveBookings(bookings.map((candidate) => candidate.id === bookingId
    ? { ...candidate, status: 'disputed', updatedAt: new Date().toISOString() }
    : candidate))) {
    saveDisputes(disputes);
    return { ok: false, message: 'Could not update the booking status. Check browser storage and try again.' };
  }
  return { ok: true, value: dispute };
}

export function respondToOwnerDispute(disputeId: string, response: string): DomainResult<Dispute> {
  const user = currentActiveUser();
  if (!user || !hasRole(user, 'owner')) return { ok: false, message: 'Sign in with an owner demo account.' };
  if (!response.trim()) return { ok: false, message: 'Write a response before submitting.' };
  const disputes = getDisputes();
  const dispute = disputes.find((candidate) => candidate.id === disputeId);
  const booking = dispute && getBookings().find((candidate) => candidate.id === dispute.bookingId);
  if (!dispute || !booking || booking.ownerId !== user.id) {
    return { ok: false, message: 'Not yours: this dispute is not connected to one of your rentals.' };
  }
  if (dispute.status === 'resolved') return { ok: false, message: 'This dispute has already been resolved.' };
  const updated = { ...dispute, ownerResponse: response.trim(), status: 'under_review' as const };
  if (!saveDisputes(disputes.map((candidate) => candidate.id === disputeId ? updated : candidate))) {
    return { ok: false, message: 'Could not save the dispute response. Check browser storage and try again.' };
  }
  return { ok: true, value: updated };
}

export function resolveBookingDispute(disputeId: string, notes: string): DomainResult<Dispute> {
  const user = currentActiveUser();
  if (!user || !hasRole(user, 'admin')) return { ok: false, message: 'Only the admin demo account can resolve disputes.' };
  if (!notes.trim()) return { ok: false, message: 'Add resolution notes before closing the dispute.' };
  const disputes = getDisputes();
  const dispute = disputes.find((candidate) => candidate.id === disputeId);
  if (!dispute || dispute.status === 'resolved') return { ok: false, message: 'This dispute is missing or already resolved.' };
  const bookings = getBookings();
  const booking = bookings.find((candidate) => candidate.id === dispute.bookingId);
  if (!booking || booking.status !== 'disputed') return { ok: false, message: 'The related booking is not in a disputable state.' };

  const updated = {
    ...dispute,
    status: 'resolved' as const,
    resolutionNotes: notes.trim(),
    resolvedBy: user.id,
    resolvedAt: new Date().toISOString(),
  };
  if (!saveDisputes(disputes.map((candidate) => candidate.id === disputeId ? updated : candidate))) {
    return { ok: false, message: 'Could not resolve the dispute. Check browser storage and try again.' };
  }
  if (!saveBookings(bookings.map((candidate) => candidate.id === booking.id
    ? { ...candidate, status: 'resolved', updatedAt: new Date().toISOString() }
    : candidate))) {
    saveDisputes(disputes);
    return { ok: false, message: 'Could not update the booking status. Check browser storage and try again.' };
  }
  return { ok: true, value: updated };
}
