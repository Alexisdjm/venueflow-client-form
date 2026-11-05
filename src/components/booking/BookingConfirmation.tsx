"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BookingApi } from "@/lib/api/booking-api";
import type { BookingReceipt } from "@/types/booking";
import { resolveBookingApi } from "@/lib/booking/resolve-api";
import { appointmentStatusLabel, formatMoney, formatWhen, publicErrorMessage } from "@/lib/booking/public-contract";
import styles from "./booking.module.css";

export function BookingReceiptCard({
  receipt,
  busy,
  error,
  onCancel,
}: {
  receipt: BookingReceipt;
  busy: boolean;
  error: string;
  onCancel: () => void;
}) {
  const when = formatWhen(receipt.start, receipt.timezone);
  const until = formatWhen(receipt.end, receipt.timezone);
  return <main className={styles.verification}>
    <span className={styles.mailIcon}>✓</span>
    <span className={styles.eyebrow}>Reserva confirmada</span>
    <h2>Nos vemos pronto</h2>
    <p>Muestra este código en recepción. Puedes volver a abrirlo desde el mismo enlace del correo.</p>
    <p className={styles.bookingCode}>{receipt.bookingCode}</p>
    <div className={styles.notice}>
      <strong>{receipt.spaName}</strong><br />
      {receipt.serviceNames.join(" + ")}<br />
      {receipt.professionalName}<br />
      {when} – {until}<br />
      {receipt.address}<br />
      {receipt.partiallyCancelled && <span>Parte de la visita fue cancelada. El total corresponde a los servicios que siguen vigentes.</span>}
      {receipt.appointments?.length ? <ul>
        {receipt.appointments.map((item) => <li key={item.id}>
          {item.serviceName} · {item.professionalName} · {formatWhen(item.start, receipt.timezone)} · {appointmentStatusLabel(item.status)}
          {item.status !== "CANCELLED" ? ` · ${formatMoney(item.price, receipt.currency)}` : ""}
        </li>)}
      </ul> : null}
      <strong>Total informado: {formatMoney(receipt.total, receipt.currency)}</strong>
    </div>
    <a className={styles.primaryButton} href={`/booking/confirmation/calendar?start=${encodeURIComponent(receipt.start)}&end=${encodeURIComponent(receipt.end)}&title=${encodeURIComponent(`Cita en ${receipt.spaName}`)}`}>Guardar en mi calendario</a>
    <button type="button" className={styles.textButton} disabled={busy} onClick={onCancel}>Cancelar reserva</button>
    {error && <p className={styles.alert} role="alert">{error}</p>}
    <Link className={styles.textButton} href="/">Hacer otra reserva</Link>
  </main>;
}

export function BookingConfirmation({ token, mode, apiBaseUrl, api: injectedApi }: { token: string; mode: "demo" | "api"; apiBaseUrl?: string; api?: BookingApi }) {
  const api = useMemo(() => resolveBookingApi(mode, apiBaseUrl, injectedApi), [mode, apiBaseUrl, injectedApi]);
  const [receipt, setReceipt] = useState<BookingReceipt>();
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.getBookingConfirmation(token).then(setReceipt).catch((reason) => setError(publicErrorMessage(reason, "No se pudo abrir el comprobante")));
  }, [api, token]);
  if (cancelled) return <main className={styles.verification}><span className={styles.mailIcon}>!</span><h2>Reserva cancelada</h2><p>Enviamos la confirmación de la cancelación a tu correo.</p><Link className={styles.primaryButton} href="/">Hacer otra reserva</Link></main>;
  if (error || !receipt) return <main className={styles.verification}><h2>{error || "Preparando tu comprobante…"}</h2></main>;
  return <BookingReceiptCard receipt={receipt} busy={busy} error={actionError} onCancel={async () => {
    setBusy(true);
    setActionError("");
    try {
      await api.cancelConfirmedBooking(token);
      setCancelled(true);
    } catch (reason) {
      setActionError(publicErrorMessage(reason, "No se pudo cancelar la reserva"));
      setBusy(false);
    }
  }} />;
}
