import { useEffect, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Pending = { message: string; resolve: (ok: boolean) => void };
let show: ((p: Pending) => void) | null = null;

/**
 * Confirmación de acciones destructivas con el diálogo del panel, en lugar de window.confirm.
 * Sin <ConfirmHost /> montado (p. ej. en pruebas) vuelve al confirm del navegador.
 */
export function confirmAction(message: string): Promise<boolean> {
  if (!show) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => show?.({ message, resolve }));
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => {
    show = setPending;
    return () => { show = null; };
  }, []);
  const close = (ok: boolean) => { pending?.resolve(ok); setPending(null); };
  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) close(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Seguro?</AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">{pending?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => close(true)}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
