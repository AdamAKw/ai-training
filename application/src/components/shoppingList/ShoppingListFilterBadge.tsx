"use client";

import { Badge } from "@/components/ui/badge";

interface ShoppingListFilterBadgeProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export function ShoppingListFilterBadge({
  label,
  count,
  isActive,
  onClick,
}: ShoppingListFilterBadgeProps) {
  return (
    <Badge
      variant={isActive ? "default" : "outline"}
      className="cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      {label} ({count})
    </Badge>
  );
}
