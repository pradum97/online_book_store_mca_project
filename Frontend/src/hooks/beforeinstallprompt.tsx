import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPromptAvailable, setIsPromptAvailable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsPromptAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const promptToInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsPromptAvailable(false);

    return choiceResult.outcome === "accepted";
  };

  return { isPromptAvailable, promptToInstall };
}
