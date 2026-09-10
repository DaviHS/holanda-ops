import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Holanda OPS",
    default: "Holanda OPS | Gestão Operacional e RH",
  },
  description:
    "Plataforma profissional para gestão de pessoas, setores, turnos e operações distribuídas.",
  applicationName: "Holanda OPS",
  authors: [{ name: "Holanda OPS" }],
  keywords: ["gestão de pessoas", "operações", "rh", "turnos", "setores", "escalas"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};