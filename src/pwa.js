import { useEffect, useState } from "react";

// 🔹 Browser's install prompt is saved here. It can fire before any page
// mounts, so it is caught at startup (see listenForInstall in main.jsx).
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function listenForInstall() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // keep it for our own button
    deferredPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

// 🔹 Hook for the install button
export function useInstallPrompt() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  // Returns "accepted" | "dismissed" | "unavailable"
  const install = async () => {
    if (!deferredPrompt) return "unavailable";
    const prompt = deferredPrompt;
    deferredPrompt = null; // a prompt can only be used once
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    notify();
    return outcome;
  };

  return {
    installed: isStandalone(),
    canPrompt: !!deferredPrompt,
    install,
  };
}
