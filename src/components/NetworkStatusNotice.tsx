import { useEffect, useState } from "react";

export function NetworkStatusNotice() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);

  useEffect(() => {
    const onlineAgain = () => setOnline(true);
    const offline = () => setOnline(false);
    window.addEventListener("online", onlineAgain);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", onlineAgain);
      window.removeEventListener("offline", offline);
    };
  }, []);

  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[100] bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950 shadow">
      Sin conexión. Los formularios no se enviarán hasta recuperar la red; conserva esta página e inténtalo de nuevo.
    </div>
  );
}
