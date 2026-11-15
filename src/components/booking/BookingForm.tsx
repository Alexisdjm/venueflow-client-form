"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type {
  AssignmentMode,
  BookingFormProps,
  BookingPaymentProof,
  BookingPolicy,
  BookingRequest,
  ExchangeQuote,
  CustomerDetails as Customer,
  Professional,
  Service,
  Slot,
  Spa,
} from "@/types/booking";
import { quotedDeposit, formatBolivars, formatMoney } from "@/lib/booking/deposit-amount";
import { compressPaymentImage } from "@/lib/booking/payment-image";
import { resolveBookingApi } from "@/lib/booking/resolve-api";
import {
  bookableOnline,
  publicErrorMessage,
} from "@/lib/booking/public-contract";
import { BookingStepper } from "./BookingStepper";
import { ServiceSelection } from "./ServiceSelection";
import { ProfessionalSelection } from "./ProfessionalSelection";
import { SequenceAssignment } from "./SequenceAssignment";
import { DateTimeSelection } from "./DateTimeSelection";
import { CustomerDetails } from "./CustomerDetails";
import { BookingSummary } from "./BookingSummary";
import { PaymentStep } from "./PaymentStep";
import styles from "./booking.module.css";

const initialCustomer: Customer = {
  name: "",
  nationalId: "",
  email: "",
  phone: "",
  acceptsPolicy: false,
  acceptsPrivacy: false,
};
const defaultTheme = {
  primary: "#725c4d",
  secondary: "#d9c5b5",
  radius: "22px",
  fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif",
};

export function BookingForm({
  spaSlug,
  apiBaseUrl,
  mode,
  theme,
  copy,
  api: injectedApi,
  onBookingConfirmed,
  whatsappNumber,
}: BookingFormProps) {
  const api = useMemo(
    () => resolveBookingApi(mode, apiBaseUrl, injectedApi),
    [mode, apiBaseUrl, injectedApi],
  );
  const [step, setStep] = useState(0),
    [catalog, setCatalog] = useState<{
      slug: string;
      spa?: Spa;
      services: Service[];
      error: string;
    } | null>(null),
    [selectedServices, setSelectedServices] = useState<Service[]>([]),
    [professionals, setProfessionals] = useState<Professional[]>([]),
    [roster, setRoster] = useState<Professional[]>([]),
    [professionalId, setProfessionalId] = useState<string>(),
    [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("auto"),
    [assignments, setAssignments] = useState<Record<string, string>>({}),
    [date, setDate] = useState(""),
    [slots, setSlots] = useState<Slot[]>([]),
    [slot, setSlot] = useState<Slot>(),
    [customer, setCustomer] = useState(initialCustomer),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [loadingSlots, setLoadingSlots] = useState(false),
    [submitting, setSubmitting] = useState(false),
    [error, setError] = useState(""),
    [request, setRequest] = useState<BookingRequest>(),
    [policy, setPolicy] = useState<BookingPolicy | null>(null),
    [methodId, setMethodId] = useState(""),
    [reference, setReference] = useState(""),
    [proof, setProof] = useState<BookingPaymentProof>(),
    [proofName, setProofName] = useState(""),
    [bolivars, setBolivars] = useState<ExchangeQuote | null>(null),
    [resendMessage, setResendMessage] = useState(""),
    [resending, setResending] = useState(false);
  const multiple = selectedServices.length > 1;
  const sequenceReady = !multiple
    ? Boolean(professionalId)
    : assignmentMode === "same"
      ? Boolean(professionalId)
      : assignmentMode === "auto" ||
        selectedServices.every((service) => assignments[service.id]);

  useEffect(() => {
    let active = true;
    Promise.all([api.getSpa(spaSlug), api.getServices(spaSlug), api.getBookingPolicy(spaSlug)])
      .then(([nextSpa, nextServices, nextPolicy]) => {
        if (!active) return;
        setPolicy(nextPolicy);
        setCatalog({
          slug: spaSlug,
          spa: nextSpa,
          services: nextServices,
          error: "",
        });
        setError("");
      })
      .catch((reason) => {
        if (!active) return;
        const message = reason instanceof Error ? reason.message : "";
        setCatalog({
          slug: spaSlug,
          services: [],
          error:
            message && message !== "Failed to fetch"
              ? message
              : "No hay conexión con la API de reservas. Comprueba que el servidor esté en marcha.",
        });
      });
    return () => {
      active = false;
    };
  }, [api, spaSlug]);
  useEffect(() => {
    if (!selectedServices.length) return;
    api
      .getProfessionals(
        spaSlug,
        selectedServices.map((service) => service.id),
      )
      .then(setProfessionals)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudieron cargar las profesionales",
        ),
      );
  }, [api, spaSlug, selectedServices]);
  useEffect(() => {
    if (!multiple) return;
    api
      .getProfessionals(spaSlug, [])
      .then(setRoster)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudieron cargar las profesionales",
        ),
      );
  }, [api, spaSlug, multiple]);
  useEffect(() => {
    if (!date || !selectedServices.length || !sequenceReady) return;
    let active = true;
    const items = selectedServices.map((service) => ({
      serviceId: service.id,
      professionalId:
        assignmentMode === "same"
          ? professionalId
          : assignmentMode === "each"
            ? assignments[service.id]
            : undefined,
    }));
    api
      .getAvailability({
        spaSlug,
        serviceIds: selectedServices.map((service) => service.id),
        professionalId: multiple ? undefined : professionalId,
        date,
        sameProfessional: multiple && assignmentMode === "same",
        items: multiple ? items : undefined,
      })
      .then((value) => active && setSlots(value))
      .catch((reason) =>
        setError(
          publicErrorMessage(reason, "No se pudo consultar disponibilidad"),
        ),
      )
      .finally(() => active && setLoadingSlots(false));
    return () => {
      active = false;
    };
  }, [
    api,
    spaSlug,
    selectedServices,
    professionalId,
    date,
    multiple,
    sequenceReady,
    assignmentMode,
    assignments,
  ]);

  const ready = catalog?.slug === spaSlug ? catalog : null;
  const loading = !ready;
  const spa = ready?.spa;
  const services = ready?.services ?? [];
  const professional = professionals.find((item) => item.id === professionalId);
  const depositOn = policy?.deposit.mode === "PERCENT" || policy?.deposit.mode === "FIXED";
  const stepLabels = depositOn
    ? ["Servicios", "Profesional", "Fecha y hora", "Tus datos", "Revisar", "Pago"]
    : ["Servicios", "Profesional", "Fecha y hora", "Tus datos", "Revisar"];
  const finalStep = stepLabels.length - 1;
  const quote = policy && spa ? quotedDeposit(policy, selectedServices.map((service) => service.price), spa.currency ?? "USD") : null;
  const paymentMethod = policy?.methods.find((item) => item.id === methodId) ?? policy?.methods[0];
  useEffect(() => {
    if (step !== 5 || !quote || !paymentMethod) return;
    let active = true;
    setBolivars(null);
    api.quoteExchange({ currency: quote.currency, method: paymentMethod.type, amount: quote.amount })
      .then((value) => {
        if (active) setBolivars(value);
      })
      .catch(() => {
        if (!active) return;
        setBolivars({
          amount: quote.amount,
          currency: quote.currency,
          applicable: paymentMethod.type !== "ZELLE" && paymentMethod.type !== "PAYPAL" && quote.currency !== "VES",
          vesAmount: null,
          source: null,
          pair: null,
          rate: null,
          quotedAt: null,
        });
      });
    return () => {
      active = false;
    };
  }, [api, step, quote?.amount, quote?.currency, paymentMethod?.id, paymentMethod?.type]);
  function clearSchedule() {
    setDate("");
    setSlots([]);
    setSlot(undefined);
  }
  function changeServices(value: Service[]) {
    setSelectedServices(value);
    setProfessionalId(undefined);
    setAssignmentMode("auto");
    setAssignments({});
    clearSchedule();
  }
  function moveService(index: number, direction: -1 | 1) {
    setSelectedServices((current) => {
      const nextServices = [...current];
      const target = index + direction;
      if (target < 0 || target >= nextServices.length) return current;
      [nextServices[index], nextServices[target]] = [
        nextServices[target],
        nextServices[index],
      ];
      return nextServices;
    });
    clearSchedule();
  }
  function validateCustomer() {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 2)
      next.name = "Escribe tu nombre completo.";
    if (!/^\d{7,8}$/.test(customer.nationalId))
      next.nationalId = "La cédula debe tener 7 u 8 dígitos.";
    if (!/^\S+@\S+\.\S+$/.test(customer.email.trim()))
      next.email = "Escribe un correo válido.";
    if (customer.phone.replace(/\D/g, "").length < 7)
      next.phone = "Usa un teléfono válido.";
    if (!customer.acceptsPolicy || !customer.acceptsPrivacy)
      next.acceptance = "Debes aceptar la política y el aviso de privacidad.";
    setErrors(next);
    return !Object.keys(next).length;
  }
  function next() {
    setError("");
    if (step === 0 && !selectedServices.length)
      return setError("Selecciona al menos un servicio.");
    if (
      step === 0 &&
      selectedServices.some((service) => !bookableOnline(service))
    )
      return setError("Hay un servicio que no se puede reservar en línea.");
    if (step === 1 && !sequenceReady)
      return setError(
        multiple && assignmentMode === "each"
          ? "Elige una profesional para cada servicio, o la asignación automática."
          : "Selecciona una profesional o la asignación automática.",
      );
    if (step === 2 && !slot)
      return setError("Selecciona una fecha y un horario disponible.");
    if (step === 3 && !validateCustomer()) return;
    setStep((value) => Math.min(value + 1, finalStep));
  }
  async function chooseProof(file: File | undefined) {
    setError("");
    if (!file) {
      setProof(undefined);
      setProofName("");
      return;
    }
    try {
      setProof(await compressPaymentImage(file));
      setProofName(file.name);
    } catch (reason) {
      setProof(undefined);
      setProofName("");
      setError(reason instanceof Error ? reason.message : "No se pudo preparar la imagen.");
    }
  }
  async function submit() {
    if (!spa || !slot || !sequenceReady || !policy || submitting) return;
    const method = policy.methods.find((item) => item.id === methodId) ?? policy.methods[0];
    let payment;
    if (policy.deposit.mode !== "NONE") {
      if (!method) return setError("Este spa no tiene un método de pago activo.");
      const cleanReference = reference.trim().replace(/\s+/g, " ");
      if (!/^[A-Za-z0-9 -]{4,40}$/.test(cleanReference)) {
        return setError("La referencia debe tener entre 4 y 40 caracteres.");
      }
      if (method.requiresProof && !proof) return setError("Adjunta la captura del pago.");
      payment = { methodId: method.id, reference: cleanReference, ...(proof ? { proof } : {}) };
    }
    setSubmitting(true);
    setError("");
    try {
      const value = await api.createBookingRequest({
        spa,
        services: selectedServices,
        professionalId,
        date,
        slot,
        customer,
        assignmentMode: multiple ? assignmentMode : undefined,
        assignments,
        payment,
      });
      setRequest(value);
      onBookingConfirmed?.(value);
    } catch (reason) {
      setError(publicErrorMessage(reason, "No se pudo solicitar la reserva"));
    } finally {
      setSubmitting(false);
    }
  }
  async function resend() {
    if (!request || resending) return;
    setResending(true);
    setResendMessage("");
    try {
      await api.resendVerification(request.requestId);
      setResendMessage(
        "Enlace reenviado. Podrás solicitar otro en 60 segundos.",
      );
    } catch (reason) {
      setResendMessage(
        publicErrorMessage(reason, "No se pudo reenviar el correo"),
      );
    } finally {
      setResending(false);
    }
  }

  const cssTheme = {
    "--booking-primary": theme?.primary ?? defaultTheme.primary,
    "--booking-secondary": theme?.secondary ?? defaultTheme.secondary,
    "--booking-radius": theme?.radius ?? defaultTheme.radius,
    "--booking-font": theme?.fontFamily ?? defaultTheme.fontFamily,
  } as CSSProperties;
  if (loading)
    return (
      <div className={styles.loading} role="status">
        Preparando tu experiencia…
      </div>
    );
  if (!spa)
    return (
      <div className={styles.fatal} role="alert">
        <strong>No pudimos abrir las reservas</strong>
        <p>{ready?.error}</p>
      </div>
    );
  if (request?.status === "AWAITING_PAYMENT")
    return (
      <div className={styles.verification} style={cssTheme}>
        <span className={styles.mailIcon}>✦</span>
        <span className={styles.eyebrow}>Pago recibido</span>
        <h2>Pendiente de validación</h2>
        <p>
          Recibimos tu adelanto de{" "}
          <strong>{formatMoney(request.depositAmount ?? quote?.amount ?? 0, request.depositCurrency ?? quote?.currency ?? "")}</strong>
          {request.depositVesAmount != null ? ` (${formatBolivars(request.depositVesAmount)} a tasa ${request.exchangeSource === "BINANCE" ? "Binance" : "BCV"})` : ""}.
          {" "}{spa?.name} lo revisará y te confirmaremos la cita por correo. El horario queda apartado hasta{" "}
          {new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short", timeZone: spa?.timezone }).format(new Date(request.expiresAt))}.
        </p>
        <div className={styles.notice}>
          La cita todavía no está confirmada. Te escribiremos a <strong>{customer.email.trim()}</strong> cuando el spa valide el pago.
        </div>
      </div>
    );
  if (request)
    return (
      <div className={styles.verification} style={cssTheme}>
        <span className={styles.mailIcon}>✦</span>
        <span className={styles.eyebrow}>Un último paso</span>
        <h2>Revisa tu correo</h2>
        <p>
          Enviamos el enlace de confirmación a{" "}
          <strong>{customer.email.trim()}</strong>. Ábrelo desde tu bandeja y
          pulsa confirmar. Tu horario todavía no está reservado.
        </p>
        <div className={styles.notice}>
          El enlace solo llega por correo y vence en 15 minutos. Al confirmar,
          usaremos este correo para tu reserva. Si no lo ves, revisa el spam.
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={resending}
          onClick={resend}
        >
          {resending ? "Reenviando…" : "Reenviar correo"}
        </button>
        <p aria-live="polite">{resendMessage}</p>
      </div>
    );

  return (
    <div className={styles.shell} style={cssTheme}>
      <header className={styles.hero}>
        <div>
          {theme?.logoUrl ? (
            <Image
              unoptimized
              width={46}
              height={46}
              src={theme.logoUrl}
              alt={`Logo de ${spa.name}`}
            />
          ) : (
            <span className={styles.logo}>V</span>
          )}
          <span>
            <b>{spa.name}</b>
            <small>Reservas online</small>
          </span>
        </div>
        <span className={styles.demoBadge}>
          {mode === "demo" ? "Modo demostración" : "Reservas en línea"}
        </span>
      </header>
      <BookingStepper step={step} labels={stepLabels} />
      <div className={styles.layout}>
        <main className={styles.panel}>
          {step === 0 && (
            <>
              <div className={styles.intro}>
                <span className={styles.eyebrow}>Reserva tu momento</span>
                <h1>{copy?.title ?? "Tu próxima pausa comienza aquí"}</h1>
                <p>
                  {copy?.subtitle ??
                    "Diseña una experiencia a tu medida, sin llamadas ni esperas."}
                </p>
              </div>
              <ServiceSelection
                services={services}
                selected={selectedServices}
                onChange={changeServices}
                whatsappNumber={whatsappNumber}
                currency={spa.currency}
              />
            </>
          )}
          {step === 1 &&
            (multiple ? (
              <SequenceAssignment
                services={selectedServices}
                mode={assignmentMode}
                onMode={(mode) => {
                  setAssignmentMode(mode);
                  setProfessionalId(undefined);
                  clearSchedule();
                }}
                professionals={professionals}
                roster={roster}
                sharedId={professionalId}
                onShared={(id) => {
                  setProfessionalId(id);
                  clearSchedule();
                }}
                assignments={assignments}
                onAssignment={(serviceId, id) => {
                  setAssignments((current) => ({
                    ...current,
                    [serviceId]: id,
                  }));
                  clearSchedule();
                }}
                onMove={moveService}
              />
            ) : (
              <ProfessionalSelection
                professionals={professionals}
                selected={professionalId}
                onChange={(id) => {
                  setProfessionalId(id);
                  clearSchedule();
                }}
              />
            ))}
          {step === 2 && (
            <DateTimeSelection
              date={date}
              onDate={(value) => {
                setLoadingSlots(Boolean(value));
                setSlots([]);
                setSlot(undefined);
                setDate(value);
              }}
              slots={slots}
              selected={slot}
              onSlot={setSlot}
              loading={loadingSlots}
              timeZone={spa?.timezone}
            />
          )}
          {step === 3 && (
            <CustomerDetails
              value={customer}
              onChange={setCustomer}
              errors={errors}
              description={depositOn ? "La cédula identifica tu historial en el spa. Te escribiremos a este correo cuando validen el pago." : undefined}
              emailHint={depositOn ? "Te escribiremos a este correo cuando el spa valide el pago." : undefined}
            />
          )}
          {step === 4 && (
            <section>
              <div className={styles.sectionHeading}>
                <span>05</span>
                <div>
                  <h2>Todo listo para revisar</h2>
                  <p>
                    {depositOn
                      ? "Comprueba los detalles antes de indicar el pago."
                      : "Comprueba los detalles antes de solicitar la verificación."}
                  </p>
                </div>
              </div>
              <BookingSummary
                spa={spa}
                services={selectedServices}
                professional={professional}
                slot={slot}
                assignmentMode={multiple ? assignmentMode : undefined}
                compact
              />
            </section>
          )}
          {step === 5 && policy && quote && (
            <PaymentStep
              policy={policy}
              amount={quote.amount}
              currency={quote.currency}
              methodId={methodId || policy.methods[0]?.id || ""}
              reference={reference}
              proofName={proofName}
              bolivars={bolivars}
              onMethod={setMethodId}
              onReference={setReference}
              onProof={chooseProof}
            />
          )}
          {error && (
            <p className={styles.alert} role="alert">
              {error}
            </p>
          )}
          <footer className={styles.actions}>
            {step > 0 ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setStep((value) => value - 1)}
              >
                Atrás
              </button>
            ) : (
              <span />
            )}
            {step < finalStep ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={next}
              >
                Continuar <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={submitting || !policy}
                onClick={submit}
              >
                {submitting ? "Enviando…" : depositOn ? "Enviar pago" : "Solicitar reserva"}
              </button>
            )}
          </footer>
        </main>
        <BookingSummary
          spa={spa}
          services={selectedServices}
          professional={professional}
          slot={slot}
          assignmentMode={multiple ? assignmentMode : undefined}
        />
      </div>
    </div>
  );
}
