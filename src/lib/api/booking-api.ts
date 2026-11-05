import type {
  BookingReceipt, BookingRequest, BookingSelection, Professional,
  Service, Slot, Spa, VerificationDetails,
} from "@/types/booking";

export interface BookingApi {
  getSpa(spaSlug: string): Promise<Spa>;
  getServices(spaSlug: string): Promise<Service[]>;
  getProfessionals(spaSlug: string, serviceIds: string[]): Promise<Professional[]>;
  getAvailability(input: {
    spaSlug: string; serviceIds: string[]; professionalId?: string; date: string;
    sameProfessional?: boolean;
    items?: { serviceId: string; professionalId?: string }[];
  }): Promise<Slot[]>;
  createBookingRequest(selection: BookingSelection): Promise<BookingRequest>;
  resendVerification(requestId: string): Promise<{ nextRetryAt: string }>;
  getVerificationDetails(token: string): Promise<VerificationDetails>;
  confirmBooking(token: string, idempotencyKey: string): Promise<BookingReceipt>;
  cancelBooking(token: string): Promise<{ status: "CANCELLED" }>;
  getBookingConfirmation(token: string): Promise<BookingReceipt>;
  cancelConfirmedBooking(token: string): Promise<{ status: "CANCELLED" }>;
}

export class BookingApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
  }
}
