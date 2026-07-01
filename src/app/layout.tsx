import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIMPACT",
  description: "Gestion interne de l'association evenementielle IIMPACT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
