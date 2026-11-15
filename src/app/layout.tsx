import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "VenueFlow";
const description = "Reserva tu cita en línea";

export const metadata: Metadata = {
  title: { default: title, template: "%s · VenueFlow" },
  description,
  applicationName: title,
  openGraph: {
    title,
    description,
    siteName: title,
    locale: "es",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#174f43" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
