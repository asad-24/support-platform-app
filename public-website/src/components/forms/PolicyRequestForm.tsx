"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCreateContactRequest } from "@/lib/api/hooks";

type PolicyRequestFormProps = {
  subjectPrefix: string;
  messageLabel: string;
  messagePlaceholder: string;
  successMessage: string;
  includeAccountFields?: boolean;
};

export function PolicyRequestForm({
  subjectPrefix,
  messageLabel,
  messagePlaceholder,
  successMessage,
  includeAccountFields = false,
}: PolicyRequestFormProps) {
  const createContactRequest = useCreateContactRequest();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const accountEmail = String(formData.get("accountEmail") ?? "");
    const message = String(formData.get("message") ?? "");

    try {
      await createContactRequest.mutateAsync({
        name,
        email,
        subject: `${subjectPrefix}${accountEmail ? ` - ${accountEmail}` : ""}`,
        message: accountEmail
          ? [`Account email: ${accountEmail}`, "", message].join("\n")
          : message,
      });
      form.reset();
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "Please check the form and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-800 ring-1 ring-emerald-100">
        <CheckCircle2 className="h-6 w-6" />
        <p className="mt-3 font-black">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      {includeAccountFields ? (
        <Field label="Account email" name="accountEmail" type="email" required />
      ) : null}
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{messageLabel}</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder={messagePlaceholder}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />
      </label>
      {error ? (
        <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "Sending..." : "Submit Request"}
      </button>
    </form>
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
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}
