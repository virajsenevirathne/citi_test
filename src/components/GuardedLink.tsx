"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { guardedNavigate, isTestInProgress } from "@/lib/testGuard";

/**
 * A next/link that asks before leaving an in-progress practice test, the same
 * way Header and BottomNav do. Use for internal links that can be visible while
 * a test is running (footer, the study links under the practice test).
 */
export default function GuardedLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || href === pathname || !isTestInProgress()) return;
        e.preventDefault();
        guardedNavigate(() => router.push(href));
      }}
      {...rest}
    />
  );
}
