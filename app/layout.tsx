import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Letter for You",
  description: "An honest letter reflecting on my mistakes, what I've realized, and the person I'm trying to become.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
