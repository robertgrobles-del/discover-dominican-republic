import React from "react";

interface BrandLogoProps {
  variant?: "horizontal" | "vertical" | "icon";
  theme?: "dark" | "light" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  className = "",
  showSubtitle = true,
}) => {
  // Dimension scales
  const sizeMap = {
    sm: { icon: 28, text: "text-sm", sub: "text-3xs" },
    md: { icon: 36, text: "text-lg", sub: "text-3xs" },
    lg: { icon: 48, text: "text-2xl", sub: "text-xs" },
    xl: { icon: 64, text: "text-3xl", sub: "text-sm" },
  };

  const { icon: iconDim, text: textSize, sub: subSize } = sizeMap[size];

  // Render pure icon SVG
  const renderIcon = () => (
    <svg
      viewBox="0 0 120 120"
      width={iconDim}
      height={iconDim}
      fill="none"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="blCaribbeanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00A3C4" />
        </linearGradient>
        <linearGradient id="blCoralSun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A59" />
          <stop offset="100%" stopColor="#FF5238" />
        </linearGradient>
        <linearGradient id="blGoldenSand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Outer Compass Guide Ring */}
      <circle cx="60" cy="60" r="48" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="2 4" />

      {/* Diagonal Compass Points */}
      <path d="M60 60 L40 40 L60 48 L60 60 Z" fill="#00E5FF" fillOpacity="0.6" />
      <path d="M60 60 L80 40 L60 48 L60 60 Z" fill="#00E5FF" fillOpacity="0.35" />
      <path d="M60 60 L80 80 L60 72 L60 60 Z" fill="#00E5FF" fillOpacity="0.6" />
      <path d="M60 60 L40 80 L60 72 L60 60 Z" fill="#00E5FF" fillOpacity="0.35" />

      {/* Cardinal Points */}
      <polygon points="60,6 66,45 60,40" fill="#00E5FF" />
      <polygon points="60,6 54,45 60,40" fill="#00A3C4" />
      <polygon points="60,114 66,75 60,80" fill="#00A3C4" />
      <polygon points="60,114 54,75 60,80" fill="#00E5FF" />
      <polygon points="114,60 75,66 80,60" fill="#00E5FF" />
      <polygon points="114,60 75,54 80,60" fill="#00A3C4" />
      <polygon points="6,60 45,66 40,60" fill="#00A3C4" />
      <polygon points="6,60 45,54 40,60" fill="#00E5FF" />

      {/* Center Core Circle */}
      <circle cx="60" cy="60" r="29" fill="#0B1317" stroke="#00E5FF" strokeWidth="2.5" />

      {/* Sun Ray Teeth & Arc */}
      <path d="M43 45 L40 38 L47 42 Z" fill="url(#blCoralSun)" />
      <path d="M52 38 L51 31 L57 37 Z" fill="url(#blCoralSun)" />
      <path d="M60 36 L60 29 L64 36 Z" fill="url(#blGoldenSand)" />
      <path d="M68 38 L72 31 L71 39 Z" fill="url(#blCoralSun)" />
      <path d="M77 45 L83 39 L78 47 Z" fill="url(#blCoralSun)" />
      <path d="M37 57 A24 24 0 0 1 83 57" fill="none" stroke="url(#blCoralSun)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Wave Crest */}
      <path d="M35 63 C 44 52, 53 54, 62 65 C 69 74, 76 72, 85 62 C 84 75, 73 85, 60 85 C 47 85, 36 75, 35 63 Z" fill="url(#blCaribbeanGlow)" />
      <path d="M35 64 Q 48 53, 61 66 T 84 62" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
      <circle cx="60" cy="60" r="3" fill="#FFFFFF" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} role="img" aria-label="Logo Descubre RD">
        {renderIcon()}
      </div>
    );
  }

  // Theme text colors
  const textClasses =
    theme === "dark"
      ? "text-white"
      : theme === "light"
      ? "text-slate-900"
      : "text-white dark:text-white";

  const subClasses =
    theme === "dark"
      ? "text-sky-300"
      : theme === "light"
      ? "text-slate-500"
      : "text-sky-200/90 dark:text-sky-300";

  if (variant === "vertical") {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 group ${className}`} role="img" aria-label="Descubre República Dominicana">
        {renderIcon()}
        <div>
          <span className={`font-display font-black tracking-tight block ${textSize} ${textClasses}`}>
            Descubre <span className="text-primary text-brand-caribbean">RD</span>
          </span>
          {showSubtitle && (
            <span className={`block font-display font-semibold tracking-widest uppercase ${subSize} ${subClasses}`}>
              República Dominicana
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`inline-flex items-center gap-2.5 group ${className}`} role="img" aria-label="Descubre República Dominicana">
      {renderIcon()}
      <div className="flex flex-col text-left">
        <span className={`font-display font-black tracking-tight leading-tight ${textSize} ${textClasses}`}>
          Descubre <span className="text-primary text-brand-caribbean">RD</span>
        </span>
        {showSubtitle && (
          <span className={`font-display font-bold tracking-[0.18em] uppercase leading-none mt-0.5 ${subSize} ${subClasses}`}>
            República Dominicana
          </span>
        )}
      </div>
    </div>
  );
};
