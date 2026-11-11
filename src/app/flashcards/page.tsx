import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import FlashcardDeck from "@/components/FlashcardDeck";

const title = "Australian Citizenship Test Flashcards — Our Common Bond Study Cards";
const description =
  "Free flashcards for the Australian citizenship test. Study key facts from Our Common Bond by topic, track what you know, and focus on what you don't.";

export const metadata: Metadata = pageMetadata(title, description, "/flashcards");

export default function FlashcardsPage() {
  return <FlashcardDeck />;
}
