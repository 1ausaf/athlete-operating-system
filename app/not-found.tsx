import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/athlete/dashboard">Athlete Portal</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/staff/athletes">Staff Workspace</Link>
        </Button>
      </div>
    </div>
  );
}
