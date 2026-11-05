import type { Service } from "@/types/booking";
import styles from "./booking.module.css";

function money(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export function bookableOnline(service: Service) {
  return service.mode === "INSTANT" && service.durationMinutes != null;
}

export function whatsappUrl(raw?: string) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  const phone = digits.startsWith("0") ? `58${digits.slice(1)}` : digits;
  const text = encodeURIComponent("Hola, quiero agendar un servicio que debe evaluar la profesional.");
  return `https://wa.me/${phone}?text=${text}`;
}

export function ServiceSelection({ services, selected, onChange, whatsappNumber }: { services: Service[]; selected: Service[]; onChange: (value: Service[]) => void; whatsappNumber?: string }) {
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
        const price = `${service.priceFrom ? "Desde " : ""}${money(service.price)}`;
        return <button type="button" key={service.id} aria-pressed={active} disabled={!online} onClick={() => toggle(service)} className={`${styles.serviceCard} ${active ? styles.selected : ""} ${online ? "" : styles.unavailable}`}>
          <span className={styles.copy}><strong>{service.name}</strong>{service.description ? <p>{service.description}</p> : null}</span>
          <span className={styles.meta}><span>{online ? `${service.durationMinutes} min` : "A evaluar"}</span><strong>{price}</strong>{!online && <small>Lo evalúa la profesional</small>}</span>
          <span className={styles.serviceCheck} aria-hidden="true">{active ? "✓" : ""}</span>
        </button>;
      })}</div>
    </section>)}</div> : <p className={styles.empty}>Este spa todavía no tiene servicios publicados.</p>}
    {services.some((service) => !bookableOnline(service)) && <p className={styles.consultationNote}>Estos servicios no se reservan en línea. La profesional debe evaluar la duración antes de confirmar el horario.{contact && <> <a href={contact} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>.</>}</p>}
  </section>;
}
