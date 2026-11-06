// Usuarios del panel de staging (solo administradores): crear, cambiar rol o contraseña y eliminar.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PanelUser { id: string; email: string; display_name: string | null; roles: string[]; created_at: string }

const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const ROLE_LABEL: Record<string, string> = { admin: "Administrador", editor: "Editor", autor: "Autor", colaborador: "Colaborador" };
const queryKey = ["staging", "users"];

export function StagingUsersManager() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data: users = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => (await fetchApi<{ data: PanelUser[] }>("/admin/users")).data,
  });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", display_name: "", password: "", role: "editor" });
  const refresh = () => void qc.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: () => fetchApi("/admin/users", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => { toast.success("Usuario creado"); setCreating(false); setForm({ email: "", display_name: "", password: "", role: "editor" }); refresh(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: string; password?: string }) =>
      fetchApi(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => { toast.success("Usuario actualizado"); refresh(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Usuario eliminado"); refresh(); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const submit = (e: FormEvent) => { e.preventDefault(); create.mutate(); };
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const changePassword = (u: PanelUser) => {
    const password = window.prompt(`Nueva contraseña para ${u.email} (12 caracteres o más):`);
    if (password) update.mutate({ id: u.id, password });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Usuarios del panel</h2>
        {!creating && <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />Nuevo usuario</Button>}
      </div>

      {creating && (
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5"><Label htmlFor="u-email">Correo *</Label><Input id="u-email" type="email" required autoComplete="off" value={form.email} onChange={set("email")} /></div>
          <div className="space-y-1.5"><Label htmlFor="u-name">Nombre</Label><Input id="u-name" value={form.display_name} onChange={set("display_name")} /></div>
          <div className="space-y-1.5">
            <Label htmlFor="u-pass">Contraseña *</Label>
            <Input id="u-pass" type="password" required minLength={12} autoComplete="new-password" value={form.password} onChange={set("password")} />
            <p className="text-xs text-muted-foreground">Mínimo 12 caracteres. Compártela por un canal seguro.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-role">Rol</Label>
            <select id="u-role" value={form.role} onChange={set("role")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="colaborador">Colaborador: escribe borradores, no publica ni sube imágenes</option>
              <option value="autor">Autor: escribe, sube imágenes y publica sus propias noticias</option>
              <option value="editor">Editor: publica y edita todo el contenido</option>
              <option value="admin">Administrador: además, usuarios y formularios</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Crear usuario</Button>
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {users.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.display_name || u.email}{isMe && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <select
                  aria-label={`Rol de ${u.email}`}
                  value={u.roles[0] ?? "editor"}
                  disabled={update.isPending}
                  onChange={(e) => update.mutate({ id: u.id, role: e.target.value })}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Button size="icon" variant="ghost" aria-label={`Cambiar contraseña de ${u.email}`} onClick={() => changePassword(u)}><KeyRound className="h-4 w-4" /></Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Eliminar ${u.email}`}
                  disabled={isMe || remove.isPending}
                  onClick={() => { if (window.confirm(`¿Eliminar a ${u.email}? Perderá el acceso al panel.`)) remove.mutate(u.id); }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
