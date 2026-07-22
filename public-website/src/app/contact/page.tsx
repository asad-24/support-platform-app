"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useCreateContactRequest } from "@/lib/api/hooks";

export default function ContactPage() {
  const createContactRequest = useCreateContactRequest();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await createContactRequest.mutateAsync({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        subject: String(formData.get("subject") ?? ""),
        message: String(formData.get("message") ?? ""),
      });
      form.reset();
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "Please check the form and try again.");
    }
  }

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
            <ContactItem icon={<Mail />} title="Email" text="contact@schoolsupportatlas.com" />
            <ContactItem icon={<Phone />} title="Phone" text="+234 800 000 0000" />
            <ContactItem icon={<MapPin />} title="Location" text="Kano, Nigeria" />
          </div>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <div className="mt-4">
            <Field label="Subject" name="subject" required />
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Message</span>
            <textarea
              name="message"
              required
              className="mt-2 h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          {status === "success" ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Message sent. The admin team has been notified.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-5 rounded-full bg-emerald-700 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
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
  icon: ReactNode;
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

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}
