import type { Metadata } from "next";
import { SchoolProfileContent } from "@/components/schools/SchoolProfileContent";

export const metadata: Metadata = {
  title: "School Profile | Naija School Relief",
};

export default async function SchoolProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolProfileContent id={id} />;
}
