import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_AUTOSAVE_INTERVAL_MS,
  buildAutoDraftSlug,
  discardLocalDraftRecord,
  getAutosaveIntervalMs,
  isRecoverableDraft,
  listLocalDrafts,
  readLocalDraftRecord,
  saveLocalDraftRecord,
  setAutosaveIntervalMs,
  useDraftAutosave,
} from "@/components/admin/staging/useDraftAutosave";

function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: online,
  });
}

describe("draft-autosave persistence and 5-10 min auto-draft hook", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setOnline(true);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-11T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("persists interval preferences within 5-10 minutes and lists recoverable drafts newest-first", () => {
    expect(getAutosaveIntervalMs()).toBe(DEFAULT_AUTOSAVE_INTERVAL_MS);
    setAutosaveIntervalMs(10 * 60_000);
    expect(getAutosaveIntervalMs()).toBe(10 * 60_000);
    setAutosaveIntervalMs(12345); // ignora valores fuera de opciones válidas
    expect(getAutosaveIntervalMs()).toBe(10 * 60_000);

    saveLocalDraftRecord({
      version: 1,
      resource: "news",
      itemId: "new",
      title: "Noticia interrumpida",
      snapshot: { title: "Noticia interrumpida" },
      serialized: '{"title":"Noticia interrumpida"}',
      updatedAt: 1000,
      dirtySince: 900,
    });
    saveLocalDraftRecord({
      version: 1,
      resource: "beaches",
      itemId: "b-1",
      title: "Playa Sosúa",
      snapshot: { name: "Playa Sosúa" },
      serialized: '{"name":"Playa Sosúa"}',
      updatedAt: 5000,
      dirtySince: 4000,
      pendingSync: true,
    });

    const list = listLocalDrafts();
    expect(list.map((d) => `${d.resource}:${d.itemId}`)).toEqual(["beaches:b-1", "news:new"]);
    expect(isRecoverableDraft(list[1], "{}")).toBe(true);
    expect(isRecoverableDraft(list[1], list[1].serialized)).toBe(false);

    discardLocalDraftRecord("news", "new");
    expect(readLocalDraftRecord("news", "new")).toBeNull();
  });

  it("generates fallback auto-draft slug cleanly even without title", () => {
    expect(buildAutoDraftSlug("Playa Rincón", "", "playa")).toBe("playa-rincon");
    expect(buildAutoDraftSlug("", "mi-slug", "noticia")).toBe("mi-slug");
    expect(buildAutoDraftSlug("", "", "evento")).toMatch(/^evento-[a-z0-9]+$/);
  });

  it("saves immediately on pagehide/beforeunload and recovers when reopened after unexpected shutdown", () => {
    const first = renderHook(
      ({ title }: { title: string }) =>
        useDraftAutosave({
          resource: "news",
          itemId: null,
          status: "draft",
          snapshot: { title },
          title,
          onRestore: vi.fn(),
          onServerAutoDraft: vi.fn(),
        }),
      { initialProps: { title: "" } },
    );

    first.rerender({ title: "Apagón repentino en redacción" });
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    const stored = readLocalDraftRecord<{ title: string }>("news", "new");
    expect(stored?.title).toBe("Apagón repentino en redacción");
    expect(stored?.snapshot.title).toBe("Apagón repentino en redacción");
    first.unmount();

    const onRestore = vi.fn();
    const reopened = renderHook(() =>
      useDraftAutosave({
        resource: "news",
        itemId: null,
        status: "draft",
        snapshot: { title: "" },
        title: "",
        onRestore,
        onServerAutoDraft: vi.fn(),
      }),
    );

    expect(reopened.result.current.recoveryDraft?.title).toBe("Apagón repentino en redacción");
    act(() => {
      reopened.result.current.restoreRecovery();
    });
    expect(onRestore).toHaveBeenCalledWith({ title: "Apagón repentino en redacción" });
    expect(reopened.result.current.recoveryDraft).toBeNull();
  });

  it("auto-saves new posts as server draft after 5 minutes and adopts ID without duplicates", async () => {
    const onServerAutoDraft = vi.fn(async () => ({ id: "news-42", slug: "borrador-auto" }));
    const onPromoted = vi.fn();

    const hook = renderHook(
      ({ title }: { title: string }) =>
        useDraftAutosave({
          resource: "news",
          itemId: null,
          status: "draft",
          snapshot: { title },
          title,
          onRestore: vi.fn(),
          onPromoted,
          onServerAutoDraft,
        }),
      { initialProps: { title: "" } },
    );

    hook.rerender({ title: "Guía de Bayahíbe" });

    // Antes de los 5 min NO debe disparar guardado en el servidor
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4 * 60_000);
    });
    expect(onServerAutoDraft).not.toHaveBeenCalled();

    // Al cumplirse los 5 minutos debe guardar automáticamente como borrador en el servidor
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75_000);
    });
    expect(onServerAutoDraft).toHaveBeenCalledTimes(1);
    expect(onServerAutoDraft).toHaveBeenCalledWith({ title: "Guía de Bayahíbe" }, null);
    expect(onPromoted).toHaveBeenCalledWith({ id: "news-42", slug: "borrador-auto", updated_at: undefined });
    expect(hook.result.current.effectiveId).toBe("news-42");
    expect(readLocalDraftRecord("news", "new")).toBeNull();
  });

  it("queues draft offline after 5 minutes and automatically syncs when internet returns", async () => {
    const onServerAutoDraft = vi.fn(async () => ({ id: "beach-7", slug: "playa-borrador" }));
    setOnline(false);

    const hook = renderHook(
      ({ name }: { name: string }) =>
        useDraftAutosave({
          resource: "beaches",
          itemId: null,
          status: "draft",
          snapshot: { name },
          title: name,
          onRestore: vi.fn(),
          onServerAutoDraft,
        }),
      { initialProps: { name: "" } },
    );

    hook.rerender({ name: "Playa Cosón" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000 + 20_000);
    });

    expect(onServerAutoDraft).not.toHaveBeenCalled();
    expect(hook.result.current.pendingSync).toBe(true);
    expect(readLocalDraftRecord("beaches", "new")?.pendingSync).toBe(true);

    // Vuelve internet -> debe sincronizar automáticamente sin esperar otro ciclo
    setOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await Promise.resolve();
    });

    expect(onServerAutoDraft).toHaveBeenCalledTimes(1);
    expect(hook.result.current.effectiveId).toBe("beach-7");
    expect(hook.result.current.pendingSync).toBe(false);
    expect(readLocalDraftRecord("beaches", "new")).toBeNull();
  });

  it("never auto-overwrites already published entries on the server while keeping local crash recovery", async () => {
    const onServerAutoDraft = vi.fn();
    const hook = renderHook(
      ({ title }: { title: string }) =>
        useDraftAutosave({
          resource: "events",
          itemId: "ev-9",
          status: "published",
          snapshot: { title },
          title,
          onRestore: vi.fn(),
          onServerAutoDraft,
        }),
      { initialProps: { title: "Carnaval Vegano" } },
    );

    hook.rerender({ title: "Carnaval Vegano (edición sin guardar)" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6 * 60_000);
    });

    expect(hook.result.current.canAutoSaveServer).toBe(false);
    expect(onServerAutoDraft).not.toHaveBeenCalled();
    expect(readLocalDraftRecord("events", "ev-9")?.title).toBe("Carnaval Vegano (edición sin guardar)");
  });
});

