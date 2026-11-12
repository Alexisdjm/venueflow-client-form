import type { CustomerDetails as Customer } from "@/types/booking";
import styles from "./booking.module.css";

export function CustomerDetails({ value, onChange, errors }: { value: Customer; onChange: (value: Customer) => void; errors: Record<string, string> }) {
  function set(name: keyof Customer, next: string) {
    onChange({ ...value, [name]: next });
  }
  return <section aria-labelledby="customer-title">
    <div className={styles.sectionHeading}><span>04</span><div><h2 id="customer-title">Cuéntanos sobre ti</h2><p>La cédula identifica tu historial en el spa. El correo de esta reserva recibirá el enlace de confirmación.</p></div></div>
    <div className={styles.formGrid}>
      <label className={styles.full}>Nombre completo<input autoComplete="name" value={value.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <small id="name-error" className={styles.error}>{errors.name}</small>}</label>
      <label>Cédula<input inputMode="numeric" autoComplete="off" maxLength={8} value={value.nationalId} onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, "").slice(0, 8))} aria-invalid={Boolean(errors.nationalId)} aria-describedby={errors.nationalId ? "nationalId-error" : undefined} />{errors.nationalId && <small id="nationalId-error" className={styles.error}>{errors.nationalId}</small>}</label>
      <label>Teléfono<input type="tel" autoComplete="tel" value={value.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} />{errors.phone && <small id="phone-error" className={styles.error}>{errors.phone}</small>}</label>
      <div className={styles.full}>
        <label>Correo electrónico<input type="email" autoComplete="email" required value={value.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error email-hint" : "email-hint"} />{errors.email && <small id="email-error" className={styles.error}>{errors.email}</small>}</label>
        <small id="email-hint" className={styles.hint}>Si ya reservaste antes, puedes usar otro correo. Actualizaremos tu contacto al confirmar este enlace.</small>
      </div>
    </div>
    <div className={styles.checks}><label><input type="checkbox" checked={value.acceptsPolicy} onChange={(e) => onChange({ ...value, acceptsPolicy: e.target.checked })} /> Acepto la política de reservas.</label><label><input type="checkbox" checked={value.acceptsPrivacy} onChange={(e) => onChange({ ...value, acceptsPrivacy: e.target.checked })} /> He leído el aviso de privacidad.</label>{errors.acceptance && <small className={styles.error}>{errors.acceptance}</small>}</div>
  </section>;
}
