import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Holanda Ops",
    short_name: "HolandaOps",
    description: "Sistema de Gestão Operacional e Recursos Humanos",
    start_url: "/",
    display: "standalone",
    background_color: "#09213d",
    theme_color: "#09213d",
    orientation: "portrait",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}