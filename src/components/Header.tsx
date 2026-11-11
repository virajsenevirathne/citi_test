"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StarIcon } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import { guardedNavigate, isTestInProgress } from "@/lib/testGuard";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/practice-test", label: "Practice & mock exam" },
] as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  function nav(e: React.MouseEvent, href: string, active: boolean) {
    if (active || !isTestInProgress()) return;
    e.preventDefault();
    guardedNavigate(() => router.push(href));
  }

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur short:static" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:py-3">
        <Link href="/" onClick={(e) => nav(e, "/", pathname === "/")} className="flex min-h-11 items-center gap-3">
          <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-accent shadow-sm"><StarIcon size={18} /></span>
          <span className="text-base font-bold leading-tight tracking-tight sm:text-lg">Australian Citizenship Practice</span>
        </Link>
        <div className="flex items-center gap-2">
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => nav(e, l.href, active)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-primary/15 font-semibold text-primary underline decoration-2 underline-offset-8" : "text-muted hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
        </div>
      </div>
      <div aria-hidden className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
    </header>
  );
}
