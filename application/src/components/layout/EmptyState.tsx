import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
}

export function EmptyState({
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 ${className}`}>
      <p className="text-gray-500 mb-4">{description}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
        {secondaryActionLabel && secondaryActionHref && (
          <Link href={secondaryActionHref}>
            <Button variant="outline">{secondaryActionLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
