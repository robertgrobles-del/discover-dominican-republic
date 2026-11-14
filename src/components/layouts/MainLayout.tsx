import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  hasHero?: boolean;
  headerVariant?: "transparent" | "dark" | "white";
  className?: string;
}

export function MainLayout({
  children,
  hasHero,
  headerVariant,
  className,
}: MainLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Header hasHero={hasHero} variant={headerVariant} />
      <main id="main-content" className={cn("flex-1", className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
