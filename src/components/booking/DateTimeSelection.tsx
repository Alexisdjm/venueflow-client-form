import type { Slot } from "@/types/booking";
import styles from "./booking.module.css";
const time = (value: string) => new Intl.DateTimeFormat("es-VE", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
export function DateTimeSelection({ date, onDate, slots, selected, onSlot, loading }: { date: string; onDate: (date: string) => void; slots: Slot[]; selected?: Slot; onSlot: (slot: Slot) => void; loading: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  return <section aria-labelledby="datetime-title"><div className={styles.sectionHeading}><span>03</span><div><h2 id="datetime-title">Encuentra tu momento</h2><p>La disponibilidad se valida en tiempo real para toda la secuencia.</p></div></div>
    <label className={styles.dateField}>Fecha<input aria-label="Fecha de la cita" type="date" min={today} value={date} onChange={(event) => onDate(event.target.value)} /></label>
    <div className={styles.slots} aria-live="polite">{!date ? <div className={styles.empty}><strong>Elige una fecha</strong><span>Los horarios disponibles aparecerán aquí.</span></div> : loading ? <p className={styles.status}>Consultando disponibilidad…</p> : slots.length ? slots.map((slot) => {
      const several = (slot.segments?.length ?? 0) > 1;
      return <button type="button" key={slot.start} aria-pressed={selected?.start === slot.start} className={selected?.start === slot.start ? styles.selected : ""} onClick={() => onSlot(slot)}><strong>{several ? `${time(slot.start)} – ${time(slot.end)}` : time(slot.start)}</strong><span>{several ? `${slot.segments?.length} servicios` : "Disponible"}</span></button>;
    }) : <div className={styles.empty}><strong>Sin horarios para este día</strong><span>Prueba otra fecha o cambia de profesional.</span></div>}</div>
  </section>;
}
