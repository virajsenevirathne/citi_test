import { Cookie } from "next/font/google";
import { SUPPORT_URL } from "@/lib/site";

const cookie = Cookie({ weight: "400", subsets: ["latin"] });

// Native equivalent of the Buy Me a Coffee "bmc-button" embed (slug:
// getaussieready). A plain link is used instead of the third-party script so it
// renders reliably in the client-routed, offline-capable PWA.
export default function SupportButton() {
  return (
    <section className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted">
        Finding this free app useful? Help keep it running.
      </p>
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cookie.className} inline-flex items-center justify-center rounded-lg border-2 border-black bg-[#FFDD00] px-6 py-2 text-2xl leading-tight text-black shadow-sm transition active:scale-95 hover:brightness-95`}
      >
        Buy me a coffee
      </a>
    </section>
  );
}
