import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - ",
    default: " - ",
    absolute: " - ",
  },
  description: 'Plataforma profissional para gestão de pessoas, setores e operações distribuídas.',
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
};