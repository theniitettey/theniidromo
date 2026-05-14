"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap({ clientId }: { clientId: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          const res = await fetch("/api/auth/google/one-tap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });
          if (res.ok) {
            window.location.reload();
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google?.accounts.id.prompt();
    };

    return () => {
      window.google?.accounts.id.cancel();
      document.body.removeChild(script);
    };
  }, [clientId]);

  return null;
}
