"use client";
import { useSearchParams } from "next/navigation";
import type { SpaIdentity } from "@/lib/booking/spa-host";
import { BookingVerification } from "./BookingVerification";
import { BookingConfirmation } from "./BookingConfirmation";

type Props = { mode: "demo" | "api"; apiBaseUrl?: string; spa: SpaIdentity };
export function VerificationRoute(props: Props) {
  const token = useSearchParams().get("token") ?? "";
  return <BookingVerification token={token} {...props} />;
}
export function ConfirmationRoute(props: Props) {
  const token = useSearchParams().get("token") ?? "";
  return <BookingConfirmation token={token} {...props} />;
}
