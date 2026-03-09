import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTranslation } from "@/hooks/useI18n";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbEntry[];
  className?: string;
}

export function PageBreadcrumbs({ items, className = "" }: PageBreadcrumbsProps) {
  const { t } = useTranslation();

  return (
    <div className={`container mx-auto px-4 pt-20 pb-2 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only">{t("common.navigation")}</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, i) => (
            <span key={i} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === items.length - 1 || !item.href ? (
                  <BreadcrumbPage className="text-xs">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="text-xs">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/** Generate JSON-LD BreadcrumbList schema */
export function generateBreadcrumbSchema(items: BreadcrumbEntry[], baseUrl = "https://descubrerd.lovable.app") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
      })),
    ],
  };
}
