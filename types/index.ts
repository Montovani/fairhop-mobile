// --- GeoJSON ---
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// --- Schedule ---
export interface Schedule {
  dayOfWeek: string;
  openTime: string; // HH:MM
  closeTime: string; // HH:MM
  frequency: "weekly" | "monthly";
  weekOfMonth?: number; // 1-4, only when frequency is "monthly"
}

// --- Fair ---
export interface Fair {
  _id: string;
  name: string;
  description?: string;
  location: GeoPoint;
  address?: string;
  category: string[];
  products: string[];
  schedule: Schedule[];
  averageRating: number;
  reviewCount: number;
  reviews: string[];
  mainPhoto?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// --- User ---
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  savedFairs: string[];
  reviews: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Review ---
export interface Review {
  _id: string;
  owner: string | { _id: string; name: string };
  fair: string;
  rate: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// --- Auth ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  _id: string;
  role: "user" | "admin";
}

// --- Request types ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateReviewRequest {
  fair: string;
  rate: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rate?: number;
  comment?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

// --- Query params ---
export interface FairQueryParams {
  lng?: number;
  lat?: number;
  maxDistance?: number;
  category?: string;
  products?: string;
  dayOfWeek?: string;
  date?: string;
}

// --- API Error ---
export interface ApiError {
  message: string;
}
