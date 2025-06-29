import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  retryButtonText: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({
  message,
  retryButtonText,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`bg-red-50 p-4 rounded-md border border-red-200 ${className}`}
    >
      <p className="text-red-600">{message}</p>
      <Button onClick={onRetry} className="mt-2">
        {retryButtonText}
      </Button>
    </div>
  );
}
