import { Eye, HandHeart, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const principles = [
  {
    icon: <ShieldCheck />,
    title: "Verified before promotion",
    text: "Schools are checked through local partners, profile evidence, and ongoing updates.",
  },
  {
    icon: <Eye />,
    title: "Clear needs, clear progress",
    text: "Every request includes estimated cost, quantity, status, and a path to follow-up.",
  },
  {
    icon: <HandHeart />,
    title: "Support that fits helpers",
    text: "People can donate money, send items, sponsor monthly, visit, or partner.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About"
          title="A public welfare platform for education support in Nigeria"
          text="Naija School Relief is designed to make school and madrasa support more visible, specific, and accountable."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&_svg]:h-6 [&_svg]:w-6">
                {item.icon}
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <p className="text-lg leading-8 text-slate-700">
            The current version uses mock data, but the folder structure is ready
            for an admin backend, database-managed profiles, media uploads,
            approval workflows, and notification providers.
          </p>
        </div>
      </section>
    </main>
  );
}
