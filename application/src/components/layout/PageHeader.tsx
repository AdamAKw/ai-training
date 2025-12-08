import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    showBackIcon?: boolean;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          asChild
          variant={action.variant || "default"}
          className="w-full sm:w-auto"
        >
          <Link href={action.href} className="flex items-center gap-2">
            {action.showBackIcon && <ArrowLeft className="h-4 w-4" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}

export function PageHeaderSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center ${className}`}
      aria-busy="true"
      aria-label="Loading header"
    >
      <div className="space-y-2 w-full sm:w-auto">
        <div className="h-7 w-40 bg-muted animate-pulse rounded sm:h-9 sm:w-56" />
        <div className="h-4 w-56 bg-muted animate-pulse rounded sm:h-5 sm:w-72" />
      </div>
      <div className="w-full sm:w-auto flex items-center">
        <div className="h-10 w-full sm:w-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
