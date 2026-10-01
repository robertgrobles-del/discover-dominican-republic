import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, FolderOpen } from "lucide-react";

interface PanelEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function PanelEmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = "",
}: PanelEmptyStateProps) {
  return (
    <Card className={`border border-dashed border-border/80 bg-card/50 text-center p-8 rounded-2xl ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div className="max-w-sm space-y-1">
          <h3 className="font-semibold text-base text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {(actionLabel || secondaryLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {actionLabel && (
              <Button size="sm" onClick={onAction} className="rounded-xl text-xs font-semibold">
                {actionLabel}
              </Button>
            )}
            {secondaryLabel && (
              <Button size="sm" variant="outline" onClick={onSecondaryAction} className="rounded-xl text-xs">
                {secondaryLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
