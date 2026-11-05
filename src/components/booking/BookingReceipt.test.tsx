import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import { BookingApiError, type BookingApi } from "@/lib/api/booking-api";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingVerification } from "./BookingVerification";
import type { BookingReceipt, VerificationDetails } from "@/types/booking";

const pending: VerificationDetails = {
  requestId: "request",
  spaName: "Bella",
  serviceNames: ["Manicure"],
  professionalName: "Ana",
  start: "2030-01-15T14:30:00.000Z",
  expiresAt: "2030-01-15T15:00:00.000Z",
  status: "PENDING",
  timezone: "America/Caracas",
  currency: "USD",
};

const receipt: BookingReceipt = {
  ...pending,
  status: "CONFIRMED",
  bookingCode: "VF-AB12CD34",
  total: 20,
  end: "2030-01-15T15:30:00.000Z",
  receiptToken: "receipt-token",
  partiallyCancelled: true,
  appointments: [
    { id: "a", serviceName: "Manicure", professionalName: "Ana", start: pending.start, end: "2030-01-15T15:00:00.000Z", status: "CONFIRMED", price: 20 },
    { id: "b", serviceName: "Color", professionalName: "Luz", start: "2030-01-15T15:00:00.000Z", end: pending.end, status: "CANCELLED", price: 40 },
  ],
};

function api(overrides: Partial<BookingApi> = {}): BookingApi {
  return {
    getSpa: jest.fn(),
    getServices: jest.fn(),
    getProfessionals: jest.fn(),
    getAvailability: jest.fn(),
    createBookingRequest: jest.fn(),
    resendVerification: jest.fn(),
    getVerificationDetails: jest.fn<() => Promise<VerificationDetails>>().mockResolvedValue(pending),
    confirmBooking: jest.fn<() => Promise<BookingReceipt>>().mockResolvedValue(receipt),
    cancelBooking: jest.fn(),
    getBookingConfirmation: jest.fn<() => Promise<BookingReceipt>>().mockResolvedValue(receipt),
    cancelConfirmedBooking: jest.fn(),
    ...overrides,
  };
}

describe("booking confirmation contract", () => {
  it("reuses the same idempotency key after a network failure", async () => {
    const user = userEvent.setup();
    const bookingApi = api({
      confirmBooking: jest.fn<() => Promise<BookingReceipt>>()
        .mockRejectedValueOnce(new BookingApiError("No pudimos conectar. Puedes intentar de nuevo sin crear otra reserva."))
        .mockResolvedValueOnce(receipt),
    });
    render(<BookingVerification token="verify-token" mode="api" api={bookingApi} />);
    await user.click(await screen.findByRole("button", { name: "Confirmar reserva" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/conectar/i);
    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));
    await screen.findByText("VF-AB12CD34");
    const calls = (bookingApi.confirmBooking as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).toBe(calls[1][1]);
    expect(calls[0][1]).toMatch(/^[\x21-\x7E]{1,128}$/);
  });

  it("shows the generic identity message without customer data", async () => {
    const user = userEvent.setup();
    const bookingApi = api({
      confirmBooking: jest.fn<() => Promise<BookingReceipt>>().mockRejectedValue(
        new BookingApiError("No se puede completar esta reserva en línea. Contacta al spa.", 409),
      ),
    });
    render(<BookingVerification token="identity-token" mode="api" api={bookingApi} />);
    await user.click(await screen.findByRole("button", { name: "Confirmar reserva" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos completar la reserva con los datos proporcionados. Contacta directamente al spa para recibir asistencia.");
  });

  it("shows an expired verification link", async () => {
    render(<BookingVerification token="expired" mode="api" api={api({
      getVerificationDetails: jest.fn<() => Promise<VerificationDetails>>().mockRejectedValue(new BookingApiError("Este enlace expiró. Elige el horario otra vez.", 410)),
    })} />);
    expect(await screen.findByRole("heading", { name: /no pudimos verificar/i })).toBeInTheDocument();
    expect(screen.getByText(/enlace expiró/i)).toBeInTheDocument();
  });

  it("shows the current receipt, including a partial cancellation", async () => {
    render(<BookingConfirmation token="receipt-token" mode="api" api={api()} />);
    expect(await screen.findByText("VF-AB12CD34")).toBeInTheDocument();
    expect(screen.getByText(/Parte de la visita fue cancelada/i)).toBeInTheDocument();
    expect(screen.getByText(/Color/)).toHaveTextContent("Cancelada");
    expect(screen.getByText(/Total informado/i)).toHaveTextContent("20,00");
    expect(screen.queryByText(/\$40|40,00/)).not.toBeInTheDocument();
  });

  it("shows the completed-visit conflict without cancelling", async () => {
    const bookingApi = api({
      cancelConfirmedBooking: jest.fn<() => Promise<{ status: "CANCELLED" }>>().mockRejectedValue(
        new BookingApiError("La visita incluye servicios completados. Contacta al spa para modificarla.", 409),
      ),
    });
    const user = userEvent.setup();
    render(<BookingConfirmation token="receipt-token" mode="api" api={bookingApi} />);
    await user.click(await screen.findByRole("button", { name: "Cancelar reserva" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/servicios completados/i);
    await waitFor(() => expect(screen.getByText("VF-AB12CD34")).toBeInTheDocument());
  });
});
