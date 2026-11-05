export type BookingMode = "demo" | "api";
export type ServiceMode = "INSTANT" | "ESTIMATED" | "CONSULTATION_REQUIRED";
export type UnavailableReason =
  | "INACTIVE"
  | "VARIABLE_DURATION"
  | "INVALID_DURATION"
  | "VARIABLE_PRICE"
  | "NO_ACTIVE_PROFESSIONAL";
export type AppointmentVisitStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type Spa = {
  id: string; slug: string; name: string; address?: string; timezone: string;
  currency?: string; cancellationPolicy?: string;
};
export type Service = {
  id: string; name: string; description: string; category: string;
  durationMinutes: number | null; price: number; priceFrom?: boolean; mode: ServiceMode;
  onlineBookable?: boolean;
  unavailableReason?: UnavailableReason | null;
  unavailableMessage?: string | null;
  compatibleWith?: string[];
};
export type Professional = {
  id: string; name: string; specialty: string; serviceIds: string[]; initials: string;
};
export type AssignmentMode = "same" | "auto" | "each";
export type SlotSegment = {
  serviceId: string; serviceName: string; professionalId: string; professionalName: string;
  start: string; end: string;
};
export type Slot = { start: string; end: string; professionalIds: string[]; segments?: SlotSegment[] };
export type CustomerDetails = {
  name: string; nationalId: string; email: string; phone: string;
  acceptsPolicy: boolean; acceptsPrivacy: boolean;
};
export type BookingSelection = {
  spa: Spa; services: Service[]; professionalId?: string; date: string;
  slot: Slot; customer: CustomerDetails;
  assignmentMode?: AssignmentMode;
  assignments?: Record<string, string>;
};
export type BookingRequest = { requestId: string; expiresAt: string };
export type BookingAppointment = {
  id: string;
  serviceName: string;
  professionalName: string;
  start: string;
  end: string;
  status: AppointmentVisitStatus;
  price: number;
};
export type BookingSummary = {
  requestId: string; spaName: string; serviceNames: string[];
  professionalName: string; start: string; expiresAt: string;
  timezone?: string; currency?: string;
};
export type VerificationDetails = BookingSummary & {
  status: "PENDING" | "EXPIRED" | "CANCELLED" | "CONFIRMED";
  bookingCode?: string; address?: string; total?: number; end?: string; receiptToken?: string;
  partiallyCancelled?: boolean;
  appointments?: BookingAppointment[];
};
export type BookingReceipt = VerificationDetails & {
  status: "CONFIRMED"; bookingCode: string;
  total: number; end: string; receiptToken: string;
};

export type BookingTheme = {
  primary: string; secondary: string; radius: string; fontFamily: string;
  logoUrl?: string;
};

export type BookingCopy = {
  title: string; subtitle: string;
};

export type BookingFormProps = {
  spaSlug: string;
  apiBaseUrl?: string;
  mode: BookingMode;
  theme?: Partial<BookingTheme>;
  copy?: Partial<BookingCopy>;
  api?: import("@/lib/api/booking-api").BookingApi;
  onBookingConfirmed?: (request: BookingRequest) => void;
  whatsappNumber?: string;
};
