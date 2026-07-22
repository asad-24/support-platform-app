import { redirect } from "next/navigation";

export default async function SingularSchoolProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/schools/${id}`);
}
