import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={cn(
            "peer w-full h-12 px-4 pt-4 pb-2 rounded-lg border bg-transparent text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            error ? "border-destructive" : "border-input",
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            "transition-all duration-200 pointer-events-none origin-left",
            "peer-focus:top-3 peer-focus:text-xs peer-focus:text-primary peer-focus:scale-90",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:scale-90",
            error && "text-destructive"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="text-xs text-destructive mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          placeholder=" "
          className={cn(
            "peer w-full min-h-[120px] px-4 pt-6 pb-2 rounded-lg border bg-transparent text-foreground resize-none",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            error ? "border-destructive" : "border-input",
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 top-4 text-muted-foreground",
            "transition-all duration-200 pointer-events-none origin-left",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:scale-90",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:scale-90",
            error && "text-destructive"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="text-xs text-destructive mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingTextarea.displayName = "FloatingTextarea";
