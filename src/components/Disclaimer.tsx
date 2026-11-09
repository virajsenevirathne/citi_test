export function DisclaimerBanner() {
  return (
    <div role="note" className="border-b border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="mx-auto max-w-6xl px-4 py-2 text-[13px] leading-snug sm:text-sm sm:text-center">
        <strong>For illustration only.</strong>{" "}
        <span className="sm:hidden">Unofficial study tool, not affiliated with the Australian Government.</span>
        <span className="hidden sm:inline">
          This is an unofficial study tool, not affiliated with or endorsed by the Australian Government or the
          Department of Home Affairs. Questions differ from the real test.
        </span>
      </p>
    </div>
  );
}

export function DisclaimerFooter() {
  return (
    <footer className="border-t border-card-border px-4 py-6 pb-28 text-center text-[13px] leading-relaxed text-muted md:pb-6">
      <p className="mx-auto max-w-2xl">
        This site is an independent practice resource provided for illustration and study purposes only. It is not an
        official test and is not affiliated with, endorsed by, or connected to the Australian Government or the
        Department of Home Affairs. Always refer to the official <em>Australian Citizenship: Our Common Bond</em>{" "}
        booklet. Passing here does not predict the result of the real test.
      </p>
    </footer>
  );
}
