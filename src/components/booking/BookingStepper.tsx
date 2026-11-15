import type { CSSProperties } from "react";
import styles from "./booking.module.css";

const labels = ["Servicios", "Profesional", "Fecha y hora", "Tus datos", "Revisar"];
export function BookingStepper({ step, labels: customLabels = labels }: { step: number; labels?: string[] }) {
  const steps = customLabels;
  return <nav aria-label="Progreso de la reserva" className={styles.stepper} style={{ "--booking-steps": steps.length } as CSSProperties}>
    <p>Paso {Math.min(step + 1, steps.length)} de {steps.length} · {steps[Math.min(step, steps.length - 1)]}</p>
    <ol>{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? styles.current : index < step ? styles.done : ""}><span>{index < step ? "✓" : index + 1}</span><b>{label}</b></li>)}</ol>
  </nav>;
}
