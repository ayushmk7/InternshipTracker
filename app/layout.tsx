import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internship Tracker",
  description: "Track internship applications from forwarded emails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
