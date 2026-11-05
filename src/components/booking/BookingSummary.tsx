import type { AssignmentMode, Professional, Service, Slot, Spa } from "@/types/booking";
import { formatMoney, formatWhen } from "@/lib/booking/public-contract";
import styles from "./booking.module.css";
function professionalLabel(mode: AssignmentMode | undefined, professional?: Professional, slot?: Slot) {
  if (slot?.segments?.length) return [...new Set(slot.segments.map((segment) => segment.professionalName))].join(" · ");
  if (mode === "auto") return "Asignación automática por servicio";
  if (mode === "each") return "Una profesional por servicio";
  return professional?.name ?? "Por elegir";
}
export function BookingSummary({ spa, services, professional, slot, assignmentMode, compact = false }: { spa?: Spa; services: Service[]; professional?: Professional; slot?: Slot; assignmentMode?: AssignmentMode; compact?: boolean }) {
  const minutes = services.reduce((sum, service) => sum + (service.durationMinutes ?? 0), 0), total = services.reduce((sum, service) => sum + service.price, 0);
  return <aside className={`${styles.summary} ${compact ? styles.compact : ""}`} aria-label="Resumen de reserva"><span className={styles.eyebrow}>Tu reserva</span><h2>{spa?.name ?? "VenueFlow"}</h2>
    {services.length ? <ul>{services.map((service) => {
      const segment = slot?.segments?.find((item) => item.serviceId === service.id);
      return <li key={service.id}><span>{service.name}<small>{segment ? segment.professionalName : service.category}</small></span><strong>{formatMoney(service.price, spa?.currency ?? "USD")}</strong></li>;
    })}</ul> : <p className={styles.muted}>Selecciona un servicio para comenzar.</p>}
    <dl><div><dt>Profesional</dt><dd>{professionalLabel(assignmentMode, professional, slot)}</dd></div><div><dt>Fecha y hora</dt><dd>{slot ? formatWhen(slot.start, spa?.timezone) : "Por elegir"}</dd></div><div><dt>Duración estimada</dt><dd>{minutes ? `${minutes} min` : "—"}</dd></div><div className={styles.total}><dt>Total estimado</dt><dd>{formatMoney(total, spa?.currency ?? "USD")}</dd></div></dl>
    {spa?.cancellationPolicy && <small>{spa.cancellationPolicy}</small>}
  </aside>;
}
