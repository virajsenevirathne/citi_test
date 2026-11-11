import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Citizenship Practice — Australian Citizenship Test",
    short_name: "Citizenship Prep",
    description: "Free Australian citizenship practice test and flashcards, based on Our Common Bond.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f3ea",
    theme_color: "#00523a",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
