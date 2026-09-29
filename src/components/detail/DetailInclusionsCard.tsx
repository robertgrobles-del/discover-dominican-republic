import React from "react";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

interface DetailInclusionsCardProps {
  included?: string[];
  notIncluded?: string[];
  excluded?: string[];
  recommendations?: string[];
  title?: string;
}

export const DetailInclusionsCard: React.FC<DetailInclusionsCardProps> = ({
  included = [],
  notIncluded = [],
  excluded = [],
  recommendations = [],
  title = "¿Qué incluye tu experiencia?",
}) => {
  const effectiveNotIncluded = notIncluded.length > 0 ? notIncluded : excluded;
  const hasInclusions = included.length > 0 || effectiveNotIncluded.length > 0;
  const hasRecommendations = recommendations.length > 0;

  if (!hasInclusions && !hasRecommendations) return null;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
      {hasInclusions && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">
            {title}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Included */}
            {included.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Lo que incluye
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not Included */}
            {notIncluded.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> No incluye
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {notIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practical Recommendations / Qué llevar */}
      {hasRecommendations && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> Recomendaciones & Qué llevar
          </h4>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            {recommendations.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
