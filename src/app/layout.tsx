import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tacticRound = localFont({
  src: [
    {
      path: "./fonts/TacticRoundExtExd-Reg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TacticRoundExtExd-Med.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/TacticRoundExtExd-Bld.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tactic",
});

export const metadata: Metadata = {
  title: "Folium",
  description: "Plataforma LCNC de portafolios de diseño gráfico de UNIMAR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} ${tacticRound.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200" id="top">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
