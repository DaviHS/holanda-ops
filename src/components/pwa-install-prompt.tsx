"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type StandaloneNavigator = Navigator & { standalone?: boolean };

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const navigatorWithStandalone = window.navigator as StandaloneNavigator;
    if (window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone) {
      return;
    }

    if (window.localStorage.getItem("holanda-ops-install-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (!installEvent || dismissed) {
    return null;
  }

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
    }
  };

  const dismiss = () => {
    window.localStorage.setItem("holanda-ops-install-dismissed", "true");
    setDismissed(true);
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border bg-background p-3 shadow-lg md:left-auto md:max-w-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">Instale o Holanda OPS</p>
        <p className="text-sm text-muted-foreground">Acesse mais rápido pelo seu dispositivo.</p>
      </div>
      <Button type="button" size="sm" onClick={install}>
        <Download />
        Instalar
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Dispensar" onClick={dismiss}>
        <X />
      </Button>
    </aside>
  );
}