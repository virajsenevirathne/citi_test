import Link from "next/link";
import type { Crumb } from "@/lib/schema";

/** Visible breadcrumb trail; the last crumb is the current page. Pair with breadcrumbList() JSON-LD. */
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-foreground">{c.name}</span>
              ) : (
                <>
                  <Link href={c.path} className="underline-offset-4 hover:text-foreground hover:underline">{c.name}</Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
