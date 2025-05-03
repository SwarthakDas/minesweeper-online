import type { Metadata } from "next";
import "./globals.css";
import {Inter} from "next/font/google"

const inter=Inter({subsets:["latin"]})

export const metadata: Metadata= {
  title: "Online Minesweeper",
  description: "A co-op Minesweeper Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
