"use client";

import { useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

declare global {
  interface Window { __pwaPrompt: BeforeInstallPromptEvent | null; }
}

export default function PWAInstall() {
  useEffect(() => {
    window.__pwaPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.__pwaPrompt = e as BeforeInstallPromptEvent;
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
  }, []);

  return null;
}
