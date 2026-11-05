"use client";
import { useSearchParams } from "next/navigation";
import { BookingVerification } from "./BookingVerification";
import { BookingConfirmation } from "./BookingConfirmation";

type Props = { mode: "demo" | "api"; apiBaseUrl?: string };
export function VerificationRoute(props: Props) {
  const token = useSearchParams().get("token") ?? "";
  return <BookingVerification token={token} {...props} />;
}
export function ConfirmationRoute(props: Props) {
  const token = useSearchParams().get("token") ?? "";
  return <BookingConfirmation token={token} {...props} />;
}
