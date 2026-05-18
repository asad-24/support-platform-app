import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";

export function LoadingBlock({ label = "Loading data..." }: { label?: string }) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        {label}
      </CardContent>
    </Card>
  );
}

export function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="font-medium">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="rounded-2xl border-red-200 bg-red-50 shadow-lg">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="size-4" />
          <span>{message}</span>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
