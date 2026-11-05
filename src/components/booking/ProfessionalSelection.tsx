import type { Professional } from "@/types/booking";
import styles from "./booking.module.css";
export function ProfessionalSelection({ professionals, selected, onChange }: { professionals: Professional[]; selected?: string; onChange: (id: string) => void }) {
  return <section aria-labelledby="professional-title"><div className={styles.sectionHeading}><span>02</span><div><h2 id="professional-title">Elige quién te atenderá</h2><p>Puedes confiar en nuestra asignación o elegir a tu especialista.</p></div></div>
    <div className={styles.professionalGrid}>{professionals.map((professional) => <button type="button" key={professional.id} aria-pressed={selected === professional.id} className={`${styles.professionalCard} ${selected === professional.id ? styles.selected : ""}`} onClick={() => onChange(professional.id)}><span className={styles.avatar}>{professional.initials}</span><span><strong>{professional.name}</strong><small>{professional.specialty}</small></span><i aria-hidden="true">✓</i></button>)}</div>
  </section>;
}
