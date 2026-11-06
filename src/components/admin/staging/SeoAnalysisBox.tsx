// Caja «Análisis SEO» del editor de noticias: hasta 3 palabras clave y la puntuación en vivo (src/lib/seoAnalysis.ts).
import { useMemo } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeSeo, scoreTone, splitKeywords, type SeoCheck, type SeoInput } from "@/lib/seoAnalysis";

export function SeoScore({ score, className = "" }: { score: number; className?: string }) {
  return <span className={`inline-flex items-center rounded border-2 px-2 py-0.5 text-sm font-bold tabular-nums ${scoreTone(score)} ${className}`}>{score}/100</span>;
}

function CheckRow({ c }: { c: SeoCheck }) {
  const Icon = c.ok ? Check : c.warn ? AlertTriangle : X;
  return (
    <li className="flex items-start gap-2">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c.ok ? "text-emerald-600" : c.warn ? "text-amber-600" : "text-red-600"}`} aria-hidden="true" />
      <span>{c.text}</span>
    </li>
  );
}

export function SeoAnalysisBox({ value, onChange, input }: { value: string; onChange: (v: string) => void; input: Omit<SeoInput, "keywords"> }) {
  const kws = [0, 1, 2].map((i) => splitKeywords(value)[i] ?? "");
  const set = (i: number, v: string) => onChange(kws.map((k, j) => (j === i ? v.replace(/\|/g, "") : k)).join("|").replace(/\|+$/, ""));
  const report = useMemo(() => analyzeSeo({ ...input, keywords: kws }), [input, value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="rounded-md border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">Análisis SEO</h3>
        <SeoScore score={report.score} />
      </header>
      <div className="space-y-4 p-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          {kws.map((k, i) => (
            <div key={i} className="space-y-1">
              <Label htmlFor={`kw-${i}`}>{i === 0 ? "Palabra clave principal" : `Palabra clave ${i + 1}`}</Label>
              <Input id={`kw-${i}`} value={k} onChange={(e) => set(i, e.target.value)} placeholder={i === 0 ? "p. ej. cruceros en Samaná" : "Opcional"} />
            </div>
          ))}
        </div>

        {report.keywords.length === 0 ? (
          <p className="text-muted-foreground">Escribe al menos una palabra clave para analizar el título, el slug, el texto alternativo y el contenido.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Palabra clave</th>
                  {["Título", "Slug", "1.er párrafo", "Descripción", "Texto alt."].map((h) => <th key={h} className="px-2 py-1.5 text-center font-medium">{h}</th>)}
                  <th className="px-2 py-1.5 text-right font-medium">Veces</th>
                  <th className="px-2 py-1.5 text-right font-medium">Densidad</th>
                  <th className="py-1.5 pl-2 text-right font-medium">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.keywords.map((k) => (
                  <tr key={k.keyword}>
                    <td className="py-2 pr-3 font-medium">{k.keyword}</td>
                    {[k.inTitle, k.inSlug, k.inIntro, k.inDescription, k.inAlt].map((ok, i) => (
                      <td key={i} className="px-2 py-2 text-center">
                        {ok ? <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Sí" /> : <X className="mx-auto h-4 w-4 text-red-600" aria-label="No" />}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right tabular-nums">{k.count}</td>
                    <td className={`px-2 py-2 text-right tabular-nums ${k.density > 2.5 ? "font-semibold text-amber-600" : ""}`}>{k.density.toFixed(1)} %</td>
                    <td className="py-2 pl-2 text-right tabular-nums">{k.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {report.keywords[0] && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">«{report.keywords[0].keyword}»</p>
              <ul className="space-y-1">{report.keywords[0].checks.map((c) => <CheckRow key={c.text} c={c} />)}</ul>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">General</p>
            <ul className="space-y-1">{report.general.map((c) => <CheckRow key={c.text} c={c} />)}</ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Las palabras clave solo sirven para este análisis; no se publican. La puntuación se calcula sobre el texto en español.</p>
      </div>
    </section>
  );
}
