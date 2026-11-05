import type { Service } from "@/types/booking";
import { bookableOnline, formatMoney } from "@/lib/booking/public-contract";
import styles from "./booking.module.css";

function unavailableLabel(service: Service) {
  if (service.mode === "CONSULTATION_REQUIRED" || service.unavailableReason === "VARIABLE_PRICE" || service.unavailableReason === "NO_ACTIVE_PROFESSIONAL") {
    return "Requiere consulta";
  }
  return "A evaluar";
}

export function whatsappUrl(raw?: string) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  const phone = digits.startsWith("0") ? `58${digits.slice(1)}` : digits;
  const text = encodeURIComponent("Hola, quiero agendar un servicio que debe evaluar la profesional.");
  return `https://wa.me/${phone}?text=${text}`;
}

export function ServiceSelection({ services, selected, onChange, whatsappNumber, currency = "USD" }: { services: Service[]; selected: Service[]; onChange: (value: Service[]) => void; whatsappNumber?: string; currency?: string }) {
  const contact = whatsappUrl(whatsappNumber);
  function toggle(service: Service) {
    if (!bookableOnline(service)) return;
    if (selected.some((item) => item.id === service.id)) {
      onChange(selected.filter((item) => item.id !== service.id));
      return;
    }
    const withoutCategory = selected.filter((item) => item.category !== service.category);
    if (withoutCategory.length >= 5) return;
    onChange([...withoutCategory, service]);
  }
  const groups = services.reduce<{ category: string; services: Service[] }[]>((list, service) => {
    const current = list.find((group) => group.category === service.category);
    if (current) current.services.push(service);
    else list.push({ category: service.category, services: [service] });
    return list;
  }, []);
  return <section aria-labelledby="service-title">
    <div className={styles.sectionHeading}><span>01</span><div><h2 id="service-title">¿Qué te gustaría reservar?</h2><p>Elige un servicio por categoría. Puedes combinar hasta cinco categorías distintas.</p></div></div>
    {groups.length ? <div className={styles.categoryList}>{groups.map((group) => <section key={group.category} className={styles.categoryGroup} aria-label={group.category}>
      <h3>{group.category}</h3>
      <div className={styles.serviceList}>{group.services.map((service) => {
        const online = bookableOnline(service);
        const active = online && selected.some((item) => item.id === service.id);
        const price = `${service.priceFrom ? "Desde " : ""}${formatMoney(service.price, currency)}`;
        return <button type="button" key={service.id} aria-pressed={active} disabled={!online} onClick={() => toggle(service)} className={`${styles.serviceCard} ${active ? styles.selected : ""} ${online ? "" : styles.unavailable}`}>
          <span className={styles.copy}><strong>{service.name}</strong>{service.description ? <p>{service.description}</p> : null}</span>
          <span className={styles.meta}><span>{online ? `${service.durationMinutes} min` : unavailableLabel(service)}</span><strong>{price}</strong>{!online && <small>{service.unavailableMessage ?? "No se reserva en línea"}</small>}</span>
          <span className={styles.serviceCheck} aria-hidden="true">{active ? "✓" : ""}</span>
        </button>;
      })}</div>
    </section>)}</div> : <p className={styles.empty}>Este spa todavía no tiene servicios publicados.</p>}
    {services.some((service) => !bookableOnline(service)) && <p className={styles.consultationNote}>{[...new Set(services.filter((service) => !bookableOnline(service)).map((service) => service.unavailableMessage).filter(Boolean))].join(" ") || "Estos servicios no se reservan en línea. La profesional debe evaluar la duración o las condiciones antes de confirmar el horario."}{contact && <> <a href={contact} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>.</>}</p>}
  </section>;
}
