// Índice "En esta página" para las páginas que reúnen varias secciones (fusiones de páginas estáticas).
export function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="En esta página" className="border-b border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 lg:px-8 py-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">En esta página</span>
        {items.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
