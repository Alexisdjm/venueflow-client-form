import type { BookingPagoMovilSender, BookingPolicy, ExchangeQuote } from "@/types/booking";
import { formatBolivars, formatMoney } from "@/lib/booking/deposit-amount";
import { venezuelanBanks } from "@/lib/venezuelan-banks";
import styles from "./booking.module.css";

const detailLabels: Record<string, string> = {
  phone: "Teléfono",
  nationalId: "Cédula",
  bank: "Banco",
  holder: "Titular",
  email: "Correo",
  payId: "ID de pago",
  note: "Nota",
  accountNumber: "Cuenta",
  link: "Enlace",
};

const emptySender: BookingPagoMovilSender = { nationalId: "", phone: "", bank: "" };

export function PaymentStep({
  policy,
  amount,
  currency,
  methodId,
  reference,
  pagoMovil,
  proofName,
  bolivars,
  onMethod,
  onReference,
  onPagoMovil,
  onProof,
}: {
  policy: BookingPolicy;
  amount: number;
  currency: string;
  methodId: string;
  reference: string;
  pagoMovil: BookingPagoMovilSender;
  proofName: string;
  bolivars: ExchangeQuote | null;
  onMethod: (id: string) => void;
  onReference: (value: string) => void;
  onPagoMovil: (value: BookingPagoMovilSender) => void;
  onProof: (file: File | undefined) => void;
}) {
  const method = policy.methods.find((item) => item.id === methodId) ?? policy.methods[0];
  const mayNeedBolivars = Boolean(method && method.type !== "ZELLE" && method.type !== "PAYPAL" && currency !== "VES");
  const sender = pagoMovil ?? emptySender;
  return (
    <section aria-labelledby="payment-title">
      <div className={styles.sectionHeading}>
        <span>06</span>
        <div>
          <h2 id="payment-title">Adelanto para reservar</h2>
          <p>La cita se confirma cuando el spa valide este pago. El horario queda apartado mientras tanto.</p>
        </div>
      </div>
      <div className={styles.payAmount}>
        <span>Monto a transferir</span>
        <b>{formatMoney(amount, currency)}</b>
        {mayNeedBolivars && !bolivars && <small>Calculando bolívares…</small>}
        {bolivars?.applicable && bolivars.vesAmount != null && (
          <small>{formatBolivars(bolivars.vesAmount)} a tasa {bolivars.source === "BINANCE" ? "Binance" : "BCV"}</small>
        )}
        {bolivars?.applicable && bolivars.vesAmount == null && (
          <small>No pudimos calcular los bolívares. Transfiere el monto en {currency}.</small>
        )}
      </div>
      <div className={styles.methods} role="radiogroup" aria-label="Método de pago">
        {policy.methods.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={item.id === method?.id}
            className={item.id === method?.id ? styles.methodSelected : styles.method}
            onClick={() => onMethod(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{Object.entries(item.details).map(([key, value]) => `${detailLabels[key] ?? key}: ${value}`).join(" · ")}</span>
          </button>
        ))}
      </div>
      {method && (
        <div className={styles.formGrid}>
          {method.type === "PAGO_MOVIL" && (
            <>
              <label>
                Cédula del pago móvil
                <input
                  value={sender.nationalId}
                  inputMode="numeric"
                  maxLength={8}
                  onChange={(event) => onPagoMovil({ ...sender, nationalId: event.target.value.replace(/\D/g, "").slice(0, 8) })}
                />
              </label>
              <label>
                Teléfono del pago móvil
                <input
                  value={sender.phone}
                  inputMode="numeric"
                  maxLength={15}
                  onChange={(event) => onPagoMovil({ ...sender, phone: event.target.value.replace(/\D/g, "").slice(0, 15) })}
                />
              </label>
              <label className={styles.full}>
                Banco desde el que pagaste
                <select
                  value={sender.bank}
                  onChange={(event) => onPagoMovil({ ...sender, bank: event.target.value })}
                >
                  <option value="">Elige un banco</option>
                  {venezuelanBanks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className={styles.full}>
            Referencia del pago
            <input value={reference} maxLength={40} onChange={(event) => onReference(event.target.value)} />
          </label>
          {method.requiresProof && (
            <label className={styles.full}>
              Captura del pago
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onProof(event.target.files?.[0])}
              />
              <small className={styles.hint}>JPG, PNG o WebP, hasta 1.5 MB.</small>
              {proofName && <small className={styles.hint}>{proofName}</small>}
            </label>
          )}
        </div>
      )}
    </section>
  );
}
