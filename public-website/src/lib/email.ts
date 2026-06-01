import type { HelpRequest } from "@/lib/types";
import { getSchoolById } from "@/lib/data/schools";

export async function sendHelpRequestEmail(request: HelpRequest) {
  const school = getSchoolById(request.schoolId);
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.HELP_REQUEST_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const payload = {
    to: adminEmail ?? "admin@example.org",
    from: fromEmail ?? "noreply@example.org",
    subject: `New help request for ${school?.name ?? request.schoolId}`,
    profileLink: `${appUrl}/schools/${request.schoolId}`,
    schoolName: school?.name,
    selectedNeeds: request.selectedNeeds,
    donor: {
      name: request.donorName,
      email: request.donorEmail,
      phone: request.donorPhone,
      country: request.donorCountry,
      preferredHelpType: request.preferredHelpType,
      message: request.message,
    },
  };

  // Backend integration point:
  // Swap this placeholder for Resend, Nodemailer, SES, or a queue-backed notification service.
  // Example env vars: RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
  console.info("Prepared help-request admin email payload", payload);

  return { ok: true, payload };
}
