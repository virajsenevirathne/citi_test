import { llmsFullTxt } from "@/lib/llms";

// Emitted as out/llms-full.txt by the static export.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
