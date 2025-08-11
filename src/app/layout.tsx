import type { Metadata } from "next";
import { defaultMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
