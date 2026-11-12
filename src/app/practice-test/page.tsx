import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PracticeTest from "@/components/PracticeTest";
import StudyLinks from "@/components/StudyLinks";
import { breadcrumbList, graph, webPage } from "@/lib/schema";
import { pageMetadata, QUESTION_COUNT, YEAR } from "@/lib/site";

const path = "/practice-test";
const title = `Australian Citizenship Practice Test ${YEAR} & Mock Exam`;
const description =
  "Free Australian citizenship practice test: 20 random questions including 5 values questions. Practise with instant answers or sit a 45-minute timed mock exam.";

export const metadata: Metadata = pageMetadata(title, description, path);

const structuredData = graph(
  webPage(path, title, description, {
    breadcrumb: breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Practice test", path },
    ]),
  }),
);

export default function PracticeTestPage() {
  return (
    <>
      <PracticeTest />
      <StudyLinks
        intro={`Each practice test draws 20 questions at random from a pool of ${QUESTION_COUNT}. Prefer to read? Every question is listed with its answer and explanation, grouped by the four parts of Our Common Bond.`}
      />
      <JsonLd data={structuredData} />
    </>
  );
}
