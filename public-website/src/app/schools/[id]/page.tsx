import type { Metadata } from "next";
import { SchoolProfileContent } from "@/components/schools/SchoolProfileContent";
import { fetchApprovedSchool } from "@/lib/api/schools";

export const metadata: Metadata = {
  title: "School Profile | School Support Atlas",
};

export default async function SchoolProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialResult = await fetchApprovedSchool(id);
  return <SchoolProfileContent id={id} initialResult={initialResult} />;
}
