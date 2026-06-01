import { NextResponse } from "next/server";
import { sendHelpRequestEmail } from "@/lib/email";
import type { HelpRequest, PreferredHelpType } from "@/lib/types";

const helpTypes: PreferredHelpType[] = [
  "Donate Money",
  "Send Items",
  "Sponsor Monthly",
  "Visit/Partner",
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const schoolId = String(body.schoolId ?? "");
  const selectedNeeds = Array.isArray(body.selectedNeeds)
    ? body.selectedNeeds.map(String)
    : [];
  const donorName = String(body.donorName ?? "").trim();
  const donorEmail = String(body.donorEmail ?? "").trim();
  const donorPhone = String(body.donorPhone ?? "").trim();
  const donorCountry = String(body.donorCountry ?? "").trim();
  const preferredHelpType = String(body.preferredHelpType ?? "") as PreferredHelpType;
  const message = String(body.message ?? "").trim();

  if (
    !schoolId ||
    selectedNeeds.length === 0 ||
    !donorName ||
    !donorEmail.includes("@") ||
    !donorPhone ||
    !donorCountry ||
    !helpTypes.includes(preferredHelpType) ||
    message.length < 3
  ) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 422 },
    );
  }

  const helpRequest: HelpRequest = {
    id: crypto.randomUUID(),
    schoolId,
    selectedNeeds,
    donorName,
    donorEmail,
    donorPhone,
    donorCountry,
    preferredHelpType,
    message,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  // Backend integration point:
  // Persist this request to a database or queue before sending notifications.
  await sendHelpRequestEmail(helpRequest);

  return NextResponse.json({ ok: true, helpRequestId: helpRequest.id });
}
