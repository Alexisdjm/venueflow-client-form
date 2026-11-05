import styles from "./booking.module.css";

const labels = ["Servicios", "Profesional", "Fecha y hora", "Tus datos", "Revisar"];
export function BookingStepper({ step }: { step: number }) {
  return <nav aria-label="Progreso de la reserva" className={styles.stepper}>
    <p>Paso {Math.min(step + 1, labels.length)} de {labels.length} · {labels[Math.min(step, labels.length - 1)]}</p>
    <ol>{labels.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? styles.current : index < step ? styles.done : ""}><span>{index < step ? "✓" : index + 1}</span><b>{label}</b></li>)}</ol>
  </nav>;
}
