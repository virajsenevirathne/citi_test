import type { Metadata } from "next";
import FlashcardDeck from "@/components/FlashcardDeck";
import JsonLd from "@/components/JsonLd";
import StudyLinks from "@/components/StudyLinks";
import { breadcrumbList, graph, webPage } from "@/lib/schema";
import { FLASHCARD_COUNT, pageMetadata } from "@/lib/site";

const path = "/flashcards";
const title = "Australian Citizenship Test Flashcards – Our Common Bond";
const description = `Free Australian citizenship test flashcards: ${FLASHCARD_COUNT} key facts from Our Common Bond. Study by topic, track what you know, and focus on what you don't.`;

export const metadata: Metadata = pageMetadata(title, description, path);

const structuredData = graph(
  webPage(path, title, description, {
    breadcrumb: breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Flashcards", path },
    ]),
  }),
);

export default function FlashcardsPage() {
  return (
    <>
      <FlashcardDeck />
      <StudyLinks
        intro={`These ${FLASHCARD_COUNT} flashcards cover the key facts from the four testable parts of Our Common Bond. Each part also has a page listing every practice question with its answer and explanation.`}
      />
      <JsonLd data={structuredData} />
    </>
  );
}
