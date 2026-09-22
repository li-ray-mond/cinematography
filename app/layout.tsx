import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mundy — Content Studio",
  description: "Personal content creation assistant for short-form cinematography",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
