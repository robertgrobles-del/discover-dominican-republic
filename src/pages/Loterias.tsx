import { useState, useEffect, useTransition, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import {
  LotteryResult,
  COMPANIES_LIST,
} from "@/data/loteriasData";
import {
  fetchLotteryResults,
  adaptResultsForView,
} from "@/services/lotteryService";
import { LotteryHero } from "@/components/loterias/LotteryHero";
import { LotteryToolbar } from "@/components/loterias/LotteryToolbar";
import { LotteryCard } from "@/components/loterias/LotteryCard";
import { LotteryChecker } from "@/components/loterias/LotteryChecker";
import { LotteryStatsSidebar } from "@/components/loterias/LotteryStatsSidebar";

export default function Loterias() {
  const { t, locale } = useI18n();
  const [results, setResults] = useState<LotteryResult[]>([]);
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

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-10">
            {/* HERO SECTION */}
            <LotteryHero
              companies={COMPANIES_LIST}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />

            {/* TOOLBAR: DATE FILTER & CHECKER */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Date & Search Toolbar + Results (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <LotteryToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onShare={handleShare}
                />

                {/* LOTTERY RESULTS GRID */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredResults.map((result) => (
                    <LotteryCard key={result.id} result={result} />
                  ))}
                  {filteredResults.length === 0 && (
                    <div className="col-span-2 text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                      <p className="font-bold text-foreground">No hay sorteos disponibles</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        No se encontraron sorteos para los filtros seleccionados.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Lucky Number Checker & Hot/Cold Stats (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <LotteryChecker
                  checkNumber={checkNumber}
                  onCheckNumberChange={setCheckNumber}
                  onSubmit={handleTestNumber}
                  checkResult={checkResult}
                />

                <LotteryStatsSidebar />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

