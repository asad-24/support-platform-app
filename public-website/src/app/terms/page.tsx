import { SectionHeading } from "@/components/common/SectionHeading";

const terms = [
  {
    title: "Use of the Service",
    text: "School Support Atlas is provided to support verified school welfare coordination. Users must submit accurate information and must not misuse the platform, attempt unauthorized access, or upload harmful content.",
  },
  {
    title: "Accounts",
    text: "Administrator and volunteer accounts may be created, approved, suspended, or removed by authorized administrators. Users are responsible for keeping login credentials secure.",
  },
  {
    title: "School and Sponsor Information",
    text: "School records, needs, photos, sponsor requests, and contact details should be submitted only when the user has permission to share them. Approved school profiles may appear publicly.",
  },
  {
    title: "No Guarantee of Funding",
    text: "Sponsor requests help the admin team coordinate support. Submitting or listing a need does not guarantee that funding, goods, or services will be provided.",
  },
  {
    title: "Changes",
    text: "The platform may update these terms as the service, Android application, or operational requirements change. Continued use means the updated terms apply.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Terms"
          title="Terms of Service"
          text="Last updated: July 22, 2026"
        />
        <div className="space-y-6 rounded-3xl bg-white p-6 leading-7 text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <p>
            These terms apply to the School Support Atlas website, Android application, and related admin tools.
          </p>
          {terms.map((item) => (
            <section key={item.title}>
              <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-3">{item.text}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-black text-slate-950">Contact</h2>
            <p className="mt-3">For questions about these terms, contact contact@schoolsupportatlas.com.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
