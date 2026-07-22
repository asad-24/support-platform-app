import { SectionHeading } from "@/components/common/SectionHeading";

const sections = [
  {
    title: "Information We Collect",
    items: [
      "Account details for administrators and approved volunteers, including name, email, phone, username, role, and account status.",
      "Volunteer profile and field submission data, including school records, school operators, locations, welfare assessments, photos, and review notes.",
      "Sponsor request details, including name, email, phone, country, organization, selected school need, preferred help type, amount or item details, and message.",
      "Contact and support messages sent through the website or app.",
      "Technical logs needed to keep the service secure and reliable.",
    ],
  },
  {
    title: "How We Use Information",
    items: [
      "To verify school records and show approved school profiles on the public website.",
      "To let administrators review schools, volunteer registrations, sponsor requests, and notifications.",
      "To contact sponsors, volunteers, school contacts, or users about submitted requests.",
      "To protect the platform from unauthorized access and misuse.",
      "To comply with operational, legal, safety, and audit responsibilities.",
    ],
  },
  {
    title: "Sharing",
    items: [
      "Approved school profile details may be shown publicly so sponsors can understand specific needs.",
      "Personal contact details are shared only with authorized administrators and service providers needed to operate email, hosting, analytics, security, or database infrastructure.",
      "We do not sell personal information.",
    ],
  },
  {
    title: "Retention and Deletion",
    items: [
      "Account and profile data is kept while an account is active or while needed for review, safety, audit, or legal reasons.",
      "Users may request account and associated data deletion from the data deletion page.",
      "Some school, review, or support records may be retained when necessary to preserve verified public-interest records, prevent fraud, or meet legal obligations.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Privacy Policy"
          title="School Support Atlas Privacy Policy"
          text="Last updated: July 22, 2026"
        />
        <div className="space-y-6 rounded-3xl bg-white p-6 leading-7 text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <p>
            School Support Atlas helps verified school welfare work by connecting administrators, volunteers, school contacts, and sponsors. This policy explains how the website and Android application handle information.
          </p>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-black text-slate-950">Security</h2>
            <p className="mt-3">
              We use authenticated admin access, role-based controls, HTTPS in production, and restricted database access to protect information. No online service can guarantee absolute security.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Children</h2>
            <p className="mt-3">
              The app is intended for administrators, approved volunteers, school operators, and sponsors. Children should not create accounts directly. Public school profiles may include aggregate counts about pupils, not child account profiles.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Contact</h2>
            <p className="mt-3">
              Questions about this policy can be sent to contact@schoolsupportatlas.com.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
