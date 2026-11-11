import type { Metadata } from "next";
import PracticeTest from "@/components/PracticeTest";
import { pageMetadata, YEAR } from "@/lib/site";

const title = `Australian Citizenship Practice Test ${YEAR} — 20 Questions & Timed Mock Exam`;
const description =
  "Take a free Australian citizenship practice test: 20 random questions including 5 Australian values questions. Practise with instant answers or sit a 45-minute timed mock exam.";

export const metadata: Metadata = pageMetadata(title, description, "/practice-test");

export default function PracticeTestPage() {
  return <PracticeTest />;
}
