"use client";

import Link from "next/link";
import { CardsIcon, HomeIcon, TargetIcon } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";
import { guardedNavigate, isTestInProgress } from "@/lib/testGuard";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/flashcards", label: "Flashcards", icon: CardsIcon },
  { href: "/practice-test", label: "Practice", icon: TargetIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-card-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                // Tapping the tab you're already on isn't a real navigation —
                // don't prompt, and don't let the guard fire prematurely.
                if (active) return;
                if (!isTestInProgress()) return;
                // Take over navigation entirely: confirm, then (if leaving)
                // consume the synthetic history-guard entry before pushing
                // the destination, so none of it is left stranded in history.
                e.preventDefault();
                guardedNavigate(() => router.push(tab.href));
              }}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition active:scale-95 active:opacity-70 ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <tab.icon size={24} className={active ? "text-primary" : ""} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
