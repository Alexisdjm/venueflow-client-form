import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import { BookingForm } from "./BookingForm";
import type { BookingApi } from "@/lib/api/booking-api";

const spa = { id: "spa", slug: "bella", name: "Bella", timezone: "America/Caracas", cancellationPolicy: "4 horas" };
const service = { id: "nails", name: "Manicure", description: "Cuidado completo", category: "Uñas", durationMinutes: 60, price: 20, mode: "INSTANT" as const, compatibleWith: [] };
const professional = { id: "any", name: "Cualquier profesional", specialty: "Asignación automática", serviceIds: ["nails"], initials: "VF" };

function api(slots = [{ start: "2030-05-20T14:00:00.000Z", end: "2030-05-20T15:00:00.000Z", professionalIds: ["pro"] }]): BookingApi {
  return {
    getSpa: jest.fn().mockResolvedValue(spa), getServices: jest.fn().mockResolvedValue([service]),
    getProfessionals: jest.fn().mockResolvedValue([professional]), getAvailability: jest.fn().mockResolvedValue(slots),
    createBookingRequest: jest.fn(), resendVerification: jest.fn(), getVerificationDetails: jest.fn(), confirmBooking: jest.fn(), cancelBooking: jest.fn(), getBookingConfirmation: jest.fn(), cancelConfirmedBooking: jest.fn(),
  };
}

describe("BookingForm", () => {
  it("navigates through service and professional selection with accessible controls", async () => {
    const user = userEvent.setup();
    render(<BookingForm spaSlug="bella" mode="demo" api={api()} />);
    expect(await screen.findByRole("heading", { name: /próxima pausa/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Manicure/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(await screen.findByRole("heading", { name: /quién te atenderá/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Cualquier profesional/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(await screen.findByLabelText("Fecha de la cita")).toBeInTheDocument();
  });

  it("shows the empty availability state returned by the API", async () => {
    const bookingApi = api([]), user = userEvent.setup();
    render(<BookingForm spaSlug="bella" mode="api" api={bookingApi} />);
    await user.click(await screen.findByRole("button", { name: /Manicure/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    await user.click(await screen.findByRole("button", { name: /Cualquier profesional/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    await user.type(screen.getByLabelText("Fecha de la cita"), "2030-05-20");
    await waitFor(() => expect(bookingApi.getAvailability).toHaveBeenCalled());
    expect(await screen.findByText(/Sin horarios para este día/i)).toBeInTheDocument();
  });

  it("keeps variable-duration services visible but not selectable", async () => {
    const bookingApi = api();
    bookingApi.getServices = jest.fn().mockResolvedValue([
      service,
      { ...service, id: "color", name: "Color", description: "Trabajo a medida", category: "Cabello", durationMinutes: null, mode: "ESTIMATED" },
    ]);
    render(<BookingForm spaSlug="bella" mode="api" api={bookingApi} whatsappNumber="04141234567" />);
    const variable = await screen.findByRole("button", { name: /Color/i });
    expect(variable).toBeDisabled();
    expect(screen.getByText(/debe evaluar la duración/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp/i })).toHaveAttribute("href", expect.stringContaining("https://wa.me/584141234567"));
    expect(screen.getByRole("button", { name: /Manicure/i })).toBeEnabled();
  });

  it("asks how to assign professionals when several fixed services are selected", async () => {
    const user = userEvent.setup();
    const bookingApi = api();
    bookingApi.getServices = jest.fn().mockResolvedValue([
      service,
      { ...service, id: "lashes", name: "Pestañas", description: "Mirada", category: "Mirada", durationMinutes: 45, price: 30 },
    ]);
    bookingApi.getProfessionals = jest.fn(async (_slug: string, ids: string[]) => [
      { id: "any", name: "Cualquier profesional", specialty: "Asignación automática", serviceIds: ids, initials: "VF" },
      { id: "ana", name: "Ana", specialty: "Uñas y mirada", serviceIds: ["nails", "lashes"], initials: "AN" },
      { id: "luz", name: "Luz", specialty: "Mirada", serviceIds: ["lashes"], initials: "LZ" },
    ]);
    render(<BookingForm spaSlug="bella" mode="api" api={bookingApi} />);
    await user.click(await screen.findByRole("button", { name: /Manicure/i }));
    await user.click(screen.getByRole("button", { name: /Pestañas/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(await screen.findByRole("heading", { name: /cómo repartimos/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /La misma profesional/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Asignación automática/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Elegir cada profesional/i })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Elegir cada profesional/i }));
    expect(screen.getByLabelText("Profesional para Manicure")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Profesional para Manicure"), "ana");
    await user.selectOptions(screen.getByLabelText("Profesional para Pestañas"), "luz");
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(await screen.findByLabelText("Fecha de la cita")).toBeInTheDocument();
  });
});
