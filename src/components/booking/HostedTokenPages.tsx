import { ConfirmationRoute, VerificationRoute } from "./BookingTokenRoutes";
import { resolveRequestSpa } from "@/lib/booking/resolve-spa-host";

export async function HostedVerification() {
  const spa = await resolveRequestSpa();
  return <VerificationRoute key={spa.slug} mode="api" apiBaseUrl="/api/v1" spa={spa} />;
}

export async function HostedConfirmation() {
  const spa = await resolveRequestSpa();
  return <ConfirmationRoute key={spa.slug} mode="api" apiBaseUrl="/api/v1" spa={spa} />;
}
