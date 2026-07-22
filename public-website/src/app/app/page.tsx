import { Download, LifeBuoy, LockKeyhole, Smartphone } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

const cards = [
  {
    icon: <Smartphone />,
    title: "Android app",
    text: "School Support Atlas for Android helps approved users review schools, send field updates, and coordinate support requests.",
  },
  {
    icon: <LifeBuoy />,
    title: "Support",
    text: "Use the support page for app help, access issues, bug reports, and school or sponsor coordination.",
    href: "/support",
  },
  {
    icon: <LockKeyhole />,
    title: "Privacy and deletion",
    text: "Privacy policy and account deletion request pages are available for users and Google Play review.",
    href: "/privacy-policy",
  },
];

export default function AppPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Android application"
              title="School Support Atlas mobile support hub"
              text="Use this page as the public website URL for the Android application, support details, privacy policy, and account deletion requests."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/support" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800">
                Contact Support
                <LifeBuoy className="h-4 w-4" />
              </Link>
              <Link href="/data-deletion" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-950 ring-1 ring-slate-200 transition hover:bg-emerald-50">
                Data Deletion
                <LockKeyhole className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
              <img src="/logo_school.png" alt="School Support Atlas" className="h-20 w-20 rounded-3xl object-cover ring-1 ring-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-950">School Support Atlas</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">Android support and publishing links</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <Download className="h-6 w-6 text-emerald-300" />
              <p className="mt-3 font-black">Google Play listing</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Add the live Play Store URL here after the app is published. Until then, this website provides the required public support and policy pages.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href || "/app"}
              className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-emerald-200"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&_svg]:h-5 [&_svg]:w-5">
                {card.icon}
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
