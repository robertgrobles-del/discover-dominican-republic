import { useState, useEffect, useTransition, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  LotteryResult,
  COMPANIES_LIST,
} from "@/data/loteriasData";
import {
  fetchLotteryResults,
  adaptResultsForView,
  fetchLotteries,
} from "@/services/lotteryService";
import { LotteryHero } from "@/components/loterias/LotteryHero";
import { LotteryToolbar } from "@/components/loterias/LotteryToolbar";
import { LotteryCard } from "@/components/loterias/LotteryCard";
import { LotteryChecker } from "@/components/loterias/LotteryChecker";

export default function Loterias() {
  const { t, locale } = useI18n();
  const [results, setResults] = useState<LotteryResult[]>([]);
  // Filtros: todas las loterías activas del panel (con su emoji local si lo hay); sin conexión, la lista local.
  const [companies, setCompanies] = useState(COMPANIES_LIST);
  useEffect(() => {
    void fetchLotteries().then((list) => {
      if (!list.length) return;
      const logo = (id: string) => COMPANIES_LIST.find((c) => c.id === id)?.logo ?? "🎰";
      setCompanies([COMPANIES_LIST[0], ...list.map((l) => ({ id: l.slug, name: l.name, logo: logo(l.slug) }))]);
    });
  }, []);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  // Lucky Number Checker Tool
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [checkResult, setCheckResult] = useState<{
    tested: boolean;
    matches: { draw: string; position: number; date: string }[];
  } | null>(null);

  // Carga de resultados desde la API (Turso)
  const loadData = async (date: string, company: string) => {
    try {
      const liveData = await fetchLotteryResults(date, company);
      if (liveData && liveData.length > 0) {
        startTransition(() => {
          setResults(adaptResultsForView(liveData, date));
        });
      } else {
        setResults([]); // sin resultados reales: la lista muestra «No hay sorteos disponibles»
      }
    } catch {
      setResults([]);
    }
  };

  useEffect(() => {
    loadData(selectedDate, selectedCompany);
  }, [selectedDate, selectedCompany]);

  const handleTestNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = checkNumber.trim().padStart(2, "0");
    if (!cleanNum || cleanNum.length < 2) {
      toast.error("Ingresa un número de 2 dígitos (ej. 42 o 08).");
      return;
    }

    const matches: { draw: string; position: number; date: string }[] = [];

    results.forEach((r) => {
      const pos = r.winningNumbers.indexOf(cleanNum);
      if (pos !== -1) {
        matches.push({
          draw: `${r.companyName} - ${r.drawName}`,
          position: pos + 1,
          date: r.date,
        });
      }
    });

    setCheckResult({
      tested: true,
      matches,
    });

    if (matches.length > 0) {
      toast.success(`¡El número ${cleanNum} resultó ganador en ${matches.length} sorteo(s)! 🎉`);
    } else {
      toast.info(`El número ${cleanNum} no ha salido premiado en la fecha seleccionada.`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Resultados de Loterías Dominicanas - Descubre RD",
          text: "Consulta los números ganadores de Leidsa, Lotería Nacional, Loteka, Real y más.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace de resultados copiado al portapapeles 📋");
    }
  };

  const filteredResults = results.filter((r) => {
    const matchCompany = selectedCompany === "all" || r.company === selectedCompany;
    const matchSearch =
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.drawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.winningNumbers.some((num) => num.includes(searchQuery));
    return matchCompany && matchSearch;
  });

  const groupedResults = useMemo(() => {
    const groups: {
      companyId: string;
      companyName: string;
      logo: string;
      draws: LotteryResult[];
    }[] = [];

    const orderedCompanies = COMPANIES_LIST.filter((c) => c.id !== "all");
    const map = new Map<string, LotteryResult[]>();

    for (const r of filteredResults) {
      const list = map.get(r.company) || [];
      list.push(r);
      map.set(r.company, list);
    }

    for (const c of orderedCompanies) {
      const draws = map.get(c.id);
      if (draws && draws.length > 0) {
        groups.push({
          companyId: c.id,
          companyName: draws[0]?.companyName || c.name,
          logo: draws[0]?.logo || c.logo,
          draws,
        });
        map.delete(c.id);
      }
    }

    for (const [compId, draws] of map.entries()) {
      if (draws.length > 0) {
        groups.push({
          companyId: compId,
          companyName: draws[0]?.companyName || compId,
          logo: draws[0]?.logo || "🎰",
          draws,
        });
      }
    }

    return groups;
  }, [filteredResults]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://descubrerepdom.com/loterias",
        "url": "https://descubrerepdom.com/loterias",
        "name": t("lottery.title"),
        "description": t("lottery.subtitle"),
        "inLanguage": locale,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://descubrerepdom.com/#website",
          "name": "Descubre República Dominicana",
          "url": "https://descubrerepdom.com"
        }
      },
      {
        "@type": "ItemList",
        "name": "Sorteos de Loterías Dominicanas Oficiales",
        "itemListElement": filteredResults.slice(0, 15).map((r, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": `${r.companyName} - ${r.drawName}`,
          "description": `Números ganadores: ${r.winningNumbers.join(" - ")}. Horario: ${r.drawTime}. Fecha: ${r.date}.`
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿A qué hora se juegan las principales loterías en República Dominicana?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Los sorteos de mediodía inician entre las 12:00 PM y 2:30 PM (La Primera, La Suerte, Real, Gana Más). Los sorteos nocturnos van desde las 7:55 PM (Loteka) hasta las 8:55 PM (LEIDSA Quiniela Palé, Loto) y 9:00 PM (Lotería Nacional)."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cómo comprobar si mi número de lotería resultó ganador?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Puedes ingresar tu número de 2 dígitos en el 'Comprobador de Números' en esta página para verificar de inmediato en cuáles sorteos y posiciones resultó premiado."
            }
          }
        ]
      }
    ]
  }), [filteredResults, locale, t]);

  return (
    <PageTransition>
      <SEOHead
        title={`${t("lottery.title")} en Vivo - Resultados Oficiales Hoy`}
        description={t("lottery.subtitle")}
        keywords="loterias dominicanas, leidsa resultados, loteria nacional gana mas, loteka mega chances, quiniela real, la primera, numeros ganadores rd, sorteos hoy"
        url="https://descubrerepdom.com/loterias"
        image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Loterías", url: "/loterias" }
        ]}
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-16 pb-20">
          {/* HERO a todo el ancho, pegado al menú */}
          <LotteryHero />

          <div className="container mx-auto px-4 lg:px-8 space-y-8 pt-8">
            {/* Comprobador en línea, entre el hero y los resultados */}
            <LotteryChecker
              checkNumber={checkNumber}
              onCheckNumberChange={setCheckNumber}
              onSubmit={handleTestNumber}
              checkResult={checkResult}
            />

            <nav aria-label="Más sobre loterías" className="flex flex-wrap gap-2 text-xs">
              <Link to="/loterias/estadisticas" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-blue-700 hover:bg-sky-50 dark:bg-card">Números calientes y fríos</Link>
              <Link to="/loterias/como-se-gana" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-blue-700 hover:bg-sky-50 dark:bg-card">Cómo se gana</Link>
              <Link to="/loterias/juego-responsable" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-blue-700 hover:bg-sky-50 dark:bg-card">Juego responsable</Link>
            </nav>

            <div className="space-y-6">
              <div className="space-y-6">
                <LotteryToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onShare={handleShare}
                />

                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Mostrando <strong className="text-foreground">{filteredResults.length}</strong> sorteos oficiales
                  </span>
                  {selectedCompany !== "all" && (
                    <button
                      onClick={() => setSelectedCompany("all")}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Ver todas las loterías
                    </button>
                  )}
                </div>

                {/* LOTTERY RESULTS GROUPED BY COMPANY */}
                <div className="space-y-10">
                  {groupedResults.map((group) => (
                    <section key={group.companyId} className="space-y-4">
                      {/* Company Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl select-none">{group.logo}</span>
                          <div>
                            <Link
                              to={`/loteria/${group.companyId}`}
                              className="group/company flex items-center gap-1.5"
                            >
                              <h2 className="font-display font-black text-lg sm:text-xl text-foreground group-hover/company:text-primary transition-colors">
                                {group.companyName}
                              </h2>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/company:text-primary group-hover/company:translate-x-0.5 transition-all" />
                            </Link>
                            <span className="text-2xs text-muted-foreground font-medium">
                              {group.draws.length} sorteo{group.draws.length > 1 ? "s" : ""} registrado{group.draws.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/loteria/${group.companyId}`}
                          className="text-xs font-semibold text-primary hover:underline hidden sm:inline-flex items-center gap-1"
                        >
                          <span>Ver empresa</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {/* Draws grid for this company */}
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {group.draws.map((result) => (
                          <LotteryCard key={result.id} result={result} selectedDate={selectedDate} />
                        ))}
                      </div>
                    </section>
                  ))}

                  {filteredResults.length === 0 && (
                    <div className="text-center py-20 bg-card/60 backdrop-blur-sm border border-dashed border-border/80 rounded-3xl space-y-2">
                      <p className="font-display font-bold text-lg text-foreground">No hay sorteos disponibles</p>
                      <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto">
                        No se encontraron sorteos para los filtros seleccionados o la fecha aún no tiene resultados cargados.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

