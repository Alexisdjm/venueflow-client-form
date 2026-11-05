import type { AssignmentMode, Professional, Service } from "@/types/booking";
import styles from "./booking.module.css";

const modes: { id: AssignmentMode; title: string; text: string }[] = [
  { id: "same", title: "La misma profesional", text: "Una sola persona hace todos los servicios." },
  { id: "auto", title: "Asignación automática", text: "Cada servicio recibe a la primera profesional disponible." },
  { id: "each", title: "Elegir cada profesional", text: "Tú decides quién hace cada servicio." },
];

export function SequenceAssignment({
  services, mode, onMode, professionals, roster, sharedId, onShared, assignments, onAssignment, onMove,
}: {
  services: Service[];
  mode: AssignmentMode;
  onMode: (mode: AssignmentMode) => void;
  professionals: Professional[];
  roster: Professional[];
  sharedId?: string;
  onShared: (id: string) => void;
  assignments: Record<string, string>;
  onAssignment: (serviceId: string, professionalId: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const specialists = professionals.filter((professional) => professional.id !== "any");
  return <section aria-labelledby="assignment-title">
    <div className={styles.sectionHeading}><span>02</span><div><h2 id="assignment-title">¿Cómo repartimos los servicios?</h2><p>Puedes mantener a la misma profesional, dejar que asignemos cada una o elegir quién hace cada servicio.</p></div></div>
    <div className={styles.modeList} role="radiogroup" aria-label="Distribución de profesionales">
      {modes.map((item) => <button type="button" key={item.id} role="radio" aria-checked={mode === item.id} className={`${styles.modeCard} ${mode === item.id ? styles.selected : ""}`} onClick={() => onMode(item.id)}><strong>{item.title}</strong><small>{item.text}</small></button>)}
    </div>
    {mode === "same" && <>
      <p className={styles.assignmentNote}>Si eliges cualquier profesional, buscamos a una sola persona que pueda hacer toda la secuencia.</p>
      <div className={styles.professionalGrid}>{professionals.map((professional) => <button type="button" key={professional.id} aria-pressed={sharedId === professional.id} className={`${styles.professionalCard} ${sharedId === professional.id ? styles.selected : ""}`} onClick={() => onShared(professional.id)}><span className={styles.avatar}>{professional.initials}</span><span><strong>{professional.name}</strong><small>{professional.specialty}</small></span><i aria-hidden="true">✓</i></button>)}</div>
      {!specialists.length && <p className={styles.assignmentNote}>Ninguna profesional ofrece todos estos servicios. Usa la asignación automática o elige a alguien distinto para cada uno.</p>}
    </>}
    {mode === "auto" && <p className={styles.assignmentNote}>En el siguiente paso verás horarios en los que cada servicio ya tiene profesional asignada.</p>}
    <ol className={styles.sequenceList}>
      {services.map((service, index) => {
        const options = roster.filter((professional) => professional.id !== "any" && professional.serviceIds.includes(service.id));
        return <li key={service.id}>
          <div><strong>{index + 1}. {service.name}</strong><small>{service.durationMinutes} min</small></div>
          <div className={styles.sequenceActions}>
            <button type="button" aria-label={`Subir ${service.name}`} disabled={index === 0} onClick={() => onMove(index, -1)}>Subir</button>
            <button type="button" aria-label={`Bajar ${service.name}`} disabled={index === services.length - 1} onClick={() => onMove(index, 1)}>Bajar</button>
            {mode === "each" && <label>Profesional
              <select aria-label={`Profesional para ${service.name}`} value={assignments[service.id] ?? ""} onChange={(event) => onAssignment(service.id, event.target.value)}>
                <option value="">Elige una opción</option>
                <option value="any">Asignar automáticamente</option>
                {options.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
              </select>
            </label>}
          </div>
        </li>;
      })}
    </ol>
  </section>;
}
