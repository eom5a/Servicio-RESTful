import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrition Tracker",
  description: "Seguimiento personal de peso, comidas, ejercicio y gimnasio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
