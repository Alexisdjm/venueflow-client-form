import type { BookingApi } from "@/lib/api/booking-api";
import type { BookingReceipt, BookingSelection, Professional, Service, Spa } from "@/types/booking";

const spa: Spa = {
  id: "demo-spa", slug: "atelier-luma", name: "Atelier Luma",
  address: "Av. Principal, Caracas", timezone: "America/Caracas",
  cancellationPolicy: "Puedes modificar o cancelar hasta 4 horas antes de tu cita.",
};
const services: Service[] = [
  { id: "nails", name: "Manicure signature", description: "Preparación, cuidado y esmaltado de larga duración.", category: "Uñas", durationMinutes: 60, price: 28, mode: "INSTANT", compatibleWith: ["lashes", "styling"] },
  { id: "lashes", name: "Lifting de pestañas", description: "Curvatura, nutrición y definición de la mirada.", category: "Cejas y pestañas", durationMinutes: 60, price: 35, mode: "INSTANT", compatibleWith: ["nails", "styling"] },
  { id: "styling", name: "Secado & styling", description: "Acabado personalizado según textura y largo.", category: "Cabello", durationMinutes: 90, price: 32, mode: "ESTIMATED", compatibleWith: ["nails", "lashes"] },
  { id: "color", name: "Diagnóstico de color", description: "Evaluación profesional antes de una transformación compleja.", category: "Colorimetría", durationMinutes: 30, price: 15, mode: "CONSULTATION_REQUIRED" },
];
const professionals: Professional[] = [
  { id: "any", name: "Cualquier profesional", specialty: "Asignación óptima según disponibilidad", serviceIds: services.map((s) => s.id), initials: "VF" },
  { id: "ana", name: "Ana Valentina", specialty: "Nail artist & mirada", serviceIds: ["nails", "lashes"], initials: "AV" },
  { id: "maria", name: "María Fernanda", specialty: "Hair stylist & color", serviceIds: ["styling", "color"], initials: "MF" },
  { id: "sofia", name: "Sofía Reyes", specialty: "Beauty specialist", serviceIds: ["nails", "lashes", "styling"], initials: "SR" },
];
let latest: BookingSelection | undefined;
let confirmed: BookingReceipt | undefined;
const cancelled = new Set<string>();

const dayAt = (date: string, hour: number, minute = 0) =>
  new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-04:00`).toISOString();

export const demoBookingApi: BookingApi = {
  async getSpa() { return spa; },
  async getServices() { return services; },
  async getProfessionals(_slug, ids) {
    return professionals.filter((p) => p.id === "any" || ids.every((id) => p.serviceIds.includes(id)));
  },
  async getAvailability(input) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    const { date, professionalId, serviceIds, items, sameProfessional } = input;
    if (date.endsWith("13")) return [];
    const chosen = services.filter((service) => serviceIds.includes(service.id));
    const sequence = serviceIds.length > 1 ? chosen : [];
    return [9, 10, 11, 14, 15, 16].map((hour, index) => {
      const start = dayAt(date, hour, index % 2 ? 30 : 0);
      let cursor = new Date(start);
      const segments = sequence.map((service, serviceIndex) => {
        const requested = items?.find((item) => item.serviceId === service.id)?.professionalId ?? (sameProfessional ? professionalId : undefined);
        const capable = professionals.filter((professional) => professional.id !== "any" && professional.serviceIds.includes(service.id));
        const person = capable.find((professional) => professional.id === requested) ?? capable[serviceIndex % Math.max(capable.length, 1)] ?? professionals[1];
        const segmentStart = cursor.toISOString();
        cursor = new Date(cursor.getTime() + (service.durationMinutes ?? 30) * 60_000);
        return {
          serviceId: service.id,
          serviceName: service.name,
          professionalId: person.id,
          professionalName: person.name,
          start: segmentStart,
          end: cursor.toISOString(),
        };
      });
      const end = segments.at(-1)?.end ?? dayAt(date, hour + 1, index % 2 ? 30 : 0);
      return {
        start,
        end,
        professionalIds: segments.length
          ? [...new Set(segments.map((segment) => segment.professionalId))]
          : professionalId && professionalId !== "any" ? [professionalId] : ["ana", "maria", "sofia"],
        ...(segments.length ? { segments } : {}),
      };
    });
  },
  async createBookingRequest(selection) {
    latest = selection;
    confirmed = undefined;
    return { requestId: "demo-request", expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() };
  },
  async resendVerification() { return { nextRetryAt: new Date(Date.now() + 60_000).toISOString() }; },
  async cancelBooking(token) {
    const details = await this.getVerificationDetails(token);
    if (details.status !== "PENDING") throw new Error("Esta solicitud ya no se puede cancelar.");
    cancelled.add(token);
    return { status: "CANCELLED" as const };
  },
  async cancelConfirmedBooking(token) {
    if (token !== confirmed?.receiptToken && token !== "demo-receipt") throw new Error("Comprobante no disponible.");
    confirmed = undefined;
    cancelled.add("demo-valid-token");
    return { status: "CANCELLED" as const };
  },
  async getVerificationDetails(token) {
    const summary = {
      requestId: "demo-request", spaName: spa.name,
      serviceNames: latest?.services.map((s) => s.name) ?? ["Manicure signature", "Secado & styling"],
      professionalName: latest?.slot.segments?.length
        ? [...new Set(latest.slot.segments.map((segment) => segment.professionalName))].join(" · ")
        : latest?.professionalId && latest.professionalId !== "any" ? professionals.find((p) => p.id === latest?.professionalId)?.name ?? "Profesional" : "La mejor profesional disponible",
      start: latest?.slot.start ?? dayAt(new Date(Date.now() + 86400000).toISOString().slice(0, 10), 10),
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };
    if (cancelled.has(token)) return { ...summary, status: "CANCELLED" as const };
    if (token === "demo-expired") return { ...summary, status: "EXPIRED" as const };
    if (confirmed && token === "demo-valid-token") return confirmed;
    if (token === "demo-used") {
      return {
        ...summary, status: "CONFIRMED" as const, bookingCode: "VF-DEMO-2847", address: spa.address,
        total: 60, end: new Date(new Date(summary.start).getTime() + 150 * 60000).toISOString(), receiptToken: "demo-receipt",
      };
    }
    return { ...summary, status: "PENDING" as const };
  },
  async confirmBooking(token) {
    if (confirmed) return confirmed;
    const detail = await this.getVerificationDetails(token);
    if (detail.status !== "PENDING") throw new Error("Este enlace ya no puede confirmarse.");
    const duration = latest?.services.reduce((sum, s) => sum + s.durationMinutes, 0) ?? 150;
    confirmed = {
      ...detail, status: "CONFIRMED", bookingCode: "VF-DEMO-2847",
      address: spa.address, total: latest?.services.reduce((sum, s) => sum + s.price, 0) ?? 60,
      end: new Date(new Date(detail.start).getTime() + duration * 60000).toISOString(), receiptToken: "demo-receipt",
    };
    return confirmed;
  },
  async getBookingConfirmation(token) {
    if (token !== "demo-receipt") throw new Error("Comprobante no disponible.");
    if (confirmed) return confirmed;
    const detail = await this.getVerificationDetails("demo-valid-token");
    return { ...detail, status: "CONFIRMED", bookingCode: "VF-DEMO-2847", address: spa.address, total: 60, end: new Date(new Date(detail.start).getTime() + 150 * 60000).toISOString(), receiptToken: token };
  },
};
