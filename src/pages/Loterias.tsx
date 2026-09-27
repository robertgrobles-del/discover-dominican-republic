import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  LotteryResult,
  DEFAULT_LOTTERY_RESULTS,
  COMPANIES_LIST,
} from "@/data/loteriasData";
import { LotteryHero } from "@/components/loterias/LotteryHero";
import { LotteryToolbar } from "@/components/loterias/LotteryToolbar";
import { LotteryCard } from "@/components/loterias/LotteryCard";
import { LotteryChecker } from "@/components/loterias/LotteryChecker";
import { LotteryStatsSidebar } from "@/components/loterias/LotteryStatsSidebar";

export default function Loterias() {
  const [results, setResults] = useState<LotteryResult[]>(DEFAULT_LOTTERY_RESULTS);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Lucky Number Checker Tool
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [checkResult, setCheckResult] = useState<{
    tested: boolean;
    matches: { draw: string; position: number; date: string }[];
  } | null>(null);

  // Load from LocalStorage or Supabase or fallback
  const fetchLotteryData = async () => {
    try {
      const stored = localStorage.getItem("descubre_rd_lottery_results");
      if (stored) {
        setResults(JSON.parse(stored));
        return;
      }

      const { data } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("event_type", "lottery_results_sync")
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].metadata?.results) {
        setResults(data[0].metadata.results);
      }
    } catch {
      console.log("Using default lottery results baseline");
    }
  };

  useEffect(() => {
    fetchLotteryData();
  }, [selectedDate]);

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
          date: r.date
        });
      }
    });

    setCheckResult({
      tested: true,
      matches
    });

    if (matches.length > 0) {
      toast.success(`¡El número ${cleanNum} resultó ganador en ${matches.length} sorteo(s) hoy! 🎉`);
    } else {
      toast.info(`El número ${cleanNum} no ha salido premiado en la fecha seleccionada.`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Resultados de Loterías Dominicanas - Descubre RD",
        text: "Consulta los números ganadores de Leidsa, Lotería Nacional, Loteka, Real y más.",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace de resultados copiado al portapapeles 📋");
    }
  };

  const filteredResults = results.filter((r) => {
    const matchCompany = selectedCompany === "all" || r.company === selectedCompany;
    const matchSearch = r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.drawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.winningNumbers.some((num) => num.includes(searchQuery));
    return matchCompany && matchSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Resultados de Loterías Dominicanas en Vivo - Leidsa, Nacional, Loteka, Real"
        description="Números ganadores de las loterías dominicanas hoy: Leidsa (Loto, Quiniela), Lotería Nacional (Gana Más), Loteka, Real, La Primera, New York y Florida. Historial y comprobador de jugadas."
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
