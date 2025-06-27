import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  /**
   * Main title of the page
   */
  title: string;
  /**
   * Optional subtitle/description text
   */
  description?: string;
  /**
   * Optional action button configuration
   */
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
  };
  /**
   * Additional CSS classes for customization
   */
  className?: string;
}

/**
 * Reusable page header component with title, description, and optional action button.
 * Provides consistent styling across all pages with mobile-first responsive design.
 */
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
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
