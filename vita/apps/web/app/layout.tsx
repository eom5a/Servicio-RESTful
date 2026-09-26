import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VITA",
  description: "Centro personal de salud, nutrición y rendimiento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
