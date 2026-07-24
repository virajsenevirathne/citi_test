import type { Metadata } from "next";
import PracticeTest from "@/components/PracticeTest";

export const metadata: Metadata = {
  title: "Practice Test — Aussie Citizenship Prep",
};

export default function PracticeTestPage() {
  return <PracticeTest />;
}
