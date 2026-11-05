import { NextRequest } from "next/server";
const icsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start"), end = request.nextUrl.searchParams.get("end"), title = request.nextUrl.searchParams.get("title") ?? "Cita VenueFlow";
  if (!start || !end || Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) return new Response("Parámetros inválidos", { status: 400 });
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VenueFlow//Booking//ES", "BEGIN:VEVENT", `UID:${crypto.randomUUID()}@venueflow`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${title.replace(/[\n,;]/g, " ")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": "attachment; filename=venueflow-cita.ics" } });
}
