"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registrado com sucesso:", reg.scope))
        .catch((err) => console.error("Falha ao registrar SW:", err));
    }
  }, []);

  return null;
}