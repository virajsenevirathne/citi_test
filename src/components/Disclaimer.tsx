import { SUPPORT_URL } from "@/lib/site";

export function DisclaimerFooter() {
  return (
    <footer className="border-t border-card-border px-4 py-6 pb-28 text-center text-[13px] leading-relaxed text-muted md:pb-6">
      <p className="mx-auto max-w-2xl">
        A free, independent study resource for the Australian citizenship test. Not affiliated with the Australian
        Government or the Department of Home Affairs, and the real test questions will differ. For the full study
        material, see the official <em>Australian Citizenship: Our Common Bond</em> booklet.
      </p>
      <p className="mt-3">
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-medium text-foreground underline-offset-4 hover:underline"
        >
          <span aria-hidden>☕</span> Support this free site
        </a>
      </p>
    </footer>
  );
}
