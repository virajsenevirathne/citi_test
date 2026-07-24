import type { Metadata } from "next";
import FlashcardDeck from "@/components/FlashcardDeck";

export const metadata: Metadata = {
  title: "Flashcards — Aussie Citizenship Prep",
};

export default function FlashcardsPage() {
  return <FlashcardDeck />;
}
