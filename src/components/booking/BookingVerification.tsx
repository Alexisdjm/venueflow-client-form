"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BookingReceipt, VerificationDetails } from "@/types/booking";
import { resolveBookingApi } from "@/lib/booking/resolve-api";
import { BookingReceiptCard } from "./BookingConfirmation";
import styles from "./booking.module.css";

function receiptFrom(details: VerificationDetails): BookingReceipt | undefined {
  if (details.status !== "CONFIRMED" || !details.bookingCode || !details.end || !details.receiptToken || typeof details.total !== "number") return undefined;
  return { ...details, status: "CONFIRMED", bookingCode: details.bookingCode, end: details.end, total: details.total, receiptToken: details.receiptToken };
}

export function BookingVerification({ token, mode, apiBaseUrl }: { token: string; mode: "demo" | "api"; apiBaseUrl?: string }) {
  const api = useMemo(() => resolveBookingApi(mode, apiBaseUrl), [mode, apiBaseUrl]);
  const [details, setDetails] = useState<VerificationDetails>();
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.getVerificationDetails(token).then(setDetails).catch((reason) => setError(reason instanceof Error ? reason.message : "Enlace inválido"));
  }, [api, token]);
  if (error) return <Result title="No pudimos verificar el enlace" text={error} />;
  if (!details) return <Result title="Validando tu enlace…" text="Esto tomará solo un momento." />;
  if (details.status === "EXPIRED") return <Result title="Este enlace expiró" text="Regresa al formulario para elegir nuevamente tu horario." />;
  if (details.status === "CANCELLED") return <Result title="Esta reserva fue cancelada" text="Si quieres otro horario, vuelve a solicitarlo." />;
  const receipt = receiptFrom(details);
  if (receipt) return <BookingReceiptCard receipt={receipt} busy={busy} error={actionError} onCancel={async () => {
    setBusy(true);
    setActionError("");
    try {
      await api.cancelConfirmedBooking(receipt.receiptToken);
      setDetails({ ...details, status: "CANCELLED" });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "No se pudo cancelar la reserva");
      setBusy(false);
    }
  }} />;
  async function confirm() {
    setBusy(true);
    setActionError("");
    try {
      setDetails(await api.confirmBooking(token, crypto.randomUUID()));
      setBusy(false);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "El horario ya no está disponible");
      setBusy(false);
    }
  }
  async function cancel() {
    setBusy(true);
    setActionError("");
    try {
      await api.cancelBooking(token);
      setDetails({ ...details, status: "CANCELLED" });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "No se pudo cancelar la solicitud");
      setBusy(false);
    }
  }
  return <main className={styles.verification}>
    <span className={styles.eyebrow}>Verificación segura</span>
    <h2>Confirma tu reserva</h2>
    <p>Revisa los datos de tu cita. El horario queda reservado cuando pulsas confirmar.</p>
    <div className={styles.notice}><strong>{details.spaName}</strong><br />{details.serviceNames.join(" + ")}<br />{details.professionalName}<br />{new Intl.DateTimeFormat("es-VE", { dateStyle: "full", timeStyle: "short" }).format(new Date(details.start))}</div>
    <button type="button" className={styles.primaryButton} disabled={busy} onClick={confirm}>{busy ? "Confirmando…" : "Confirmar reserva"}</button>
    <button type="button" className={styles.textButton} disabled={busy} onClick={cancel}>Cancelar solicitud</button>
    {actionError && <p className={styles.alert} role="alert">{actionError}</p>}
  </main>;
}

function Result({ title, text }: { title: string; text: string }) {
  return <main className={styles.verification}><span className={styles.mailIcon}>!</span><h2>{title}</h2><p>{text}</p><Link className={styles.primaryButton} href="/">Volver a reservar</Link></main>;
}
