import type { Metadata } from "next";
import { Forum, Spectral } from "next/font/google";
import "./globals.css";

// Forum — сийлсэн бичээс шиг сонгодог том үсэг (гарчигт).
const display = Forum({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
});

// Spectral — уран зохиолын маягийн нямбай кирилл бие (текст).
const body = Spectral({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ургийн мод",
  description: "Монгол уламжлалт хэв маягийн ургийн модны систем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
