"use client";

import Link from "next/link";
import { confirmLeaveIfTestInProgress } from "@/lib/testGuard";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-card-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-3">
        <Link
          href="/"
          onClick={(e) => {
            if (!confirmLeaveIfTestInProgress()) e.preventDefault();
          }}
          className="flex items-center gap-2 font-semibold text-primary active:scale-95 transition"
        >
          <span aria-hidden className="text-xl">⭐</span>
          <span>Aussie Citizenship Prep</span>
        </Link>
      </div>
    </header>
  );
}
