import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

export default function ContactPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Partner with verified school welfare work"
            text="Reach out for school verification, field partnerships, donor coordination, or admin onboarding."
          />
          <div className="grid gap-4">
            <ContactItem icon={<Mail />} title="Email" text="admin@naijaschoolrelief.org" />
            <ContactItem icon={<Phone />} title="Phone" text="+234 800 000 0000" />
            <ContactItem icon={<MapPin />} title="Field coverage" text="Lagos, FCT, Kano, Kaduna, Borno, Oyo, Sokoto, Rivers" />
          </div>
        </div>
        <form className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" />
            <Field label="Email" type="email" />
          </div>
          <div className="mt-4">
            <Field label="Subject" />
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Message</span>
            <textarea className="mt-2 h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
          </label>
          <button
            type="button"
            className="mt-5 rounded-full bg-emerald-700 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}

function ContactItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
        <div>
          <p className="font-black text-slate-950">{title}</p>
          <p className="mt-1 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}
