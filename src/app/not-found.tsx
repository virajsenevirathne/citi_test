import Link from "next/link";
import { CompassIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-20 text-center">
      <CompassIcon size={56} className="mx-auto text-primary" />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted">That page doesn&rsquo;t exist. Let&rsquo;s get you back to studying.</p>
      <Link href="/" className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
        Go to home
      </Link>
    </div>
  );
}
