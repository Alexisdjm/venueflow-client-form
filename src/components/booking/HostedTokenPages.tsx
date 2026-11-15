import { ConfirmationRoute, VerificationRoute } from "./BookingTokenRoutes";
import { resolveSpaBySlug } from "@/lib/booking/resolve-spa-host";

export async function HostedVerification({ slug }: { slug: string }) {
  const spa = await resolveSpaBySlug(slug);
  return <VerificationRoute key={spa.slug} mode="api" apiBaseUrl="/api/v1" spa={spa} />;
}

export async function HostedConfirmation({ slug }: { slug: string }) {
  const spa = await resolveSpaBySlug(slug);
  return <ConfirmationRoute key={spa.slug} mode="api" apiBaseUrl="/api/v1" spa={spa} />;
}
