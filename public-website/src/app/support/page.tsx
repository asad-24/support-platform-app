import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PolicyRequestForm } from "@/components/forms/PolicyRequestForm";

export default function SupportPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Support"
            title="App and website support"
            text="Use this page for Android app support, account access issues, bug reports, sponsor coordination, and school profile questions."
          />
          <div className="grid gap-4">
            <Info icon={<Mail />} title="Support email" text="contact@schoolsupportatlas.com" />
            <Info icon={<Phone />} title="Phone" text="+234 800 000 0000" />
            <Info icon={<MapPin />} title="Location" text="Kano, Nigeria" />
          </div>
        </div>
        <PolicyRequestForm
          subjectPrefix="Support request"
          messageLabel="How can we help?"
          messagePlaceholder="Describe your app, account, school, sponsor, or website issue."
          successMessage="Support request sent. The admin team has been notified."
        />
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
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
