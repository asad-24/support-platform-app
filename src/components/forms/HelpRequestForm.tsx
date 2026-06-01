"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useCreateHelpRequest } from "@/lib/api/hooks";
import type { PreferredHelpType, School } from "@/lib/types";

const helpTypes: PreferredHelpType[] = [
  "Donate Money",
  "Send Items",
  "Sponsor Monthly",
  "Visit/Partner",
];

export function HelpRequestForm({
  school,
  initialNeedIds = [],
  onSuccess,
}: {
  school: School;
  initialNeedIds?: string[];
  onSuccess?: () => void;
}) {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(
    initialNeedIds.length ? initialNeedIds : school.needs.map((need) => need.id),
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const createHelpRequest = useCreateHelpRequest();

  const selectedSummary = useMemo(
    () =>
      school.needs
        .filter((need) => selectedNeeds.includes(need.id))
        .map((need) => need.title)
        .join(", "),
    [school.needs, selectedNeeds],
  );

  function toggleNeed(id: string) {
    setSelectedNeeds((current) =>
      current.includes(id)
        ? current.filter((needId) => needId !== id)
        : [...current, id],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const formData = new FormData(event.currentTarget);

    const payload = {
      schoolId: school.id,
      selectedNeeds,
      donorName: String(formData.get("donorName") ?? ""),
      donorEmail: String(formData.get("donorEmail") ?? ""),
      donorPhone: String(formData.get("donorPhone") ?? ""),
      donorCountry: String(formData.get("donorCountry") ?? ""),
      preferredHelpType: String(
        formData.get("preferredHelpType") ?? "Donate Money",
      ) as PreferredHelpType,
      message: String(formData.get("message") ?? ""),
    };

    try {
      await createHelpRequest.mutateAsync(payload);
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Please check the form and try again.",
      );
      return;
    }

    setStatus("success");
    setTimeout(() => onSuccess?.(), 1400);
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-100">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
        <h3 className="mt-4 text-2xl font-black text-slate-950">
          Thank you. The team has been notified.
        </h3>
        <p className="mt-3 text-slate-600">
          Admin will receive the school, selected needs, donor details, and profile link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <p className="text-sm font-black text-slate-950">Selected needs</p>
        <p className="mt-1 text-sm text-slate-600">
          {selectedSummary || "No need selected"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {school.needs.map((need) => (
            <label
              key={need.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-emerald-200"
            >
              <input
                type="checkbox"
                checked={selectedNeeds.includes(need.id)}
                onChange={() => toggleNeed(need.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{need.title}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="donorName" required />
        <Field label="Email" name="donorEmail" type="email" required />
        <Field label="Phone or WhatsApp" name="donorPhone" required />
        <Field label="Country" name="donorCountry" required />
      </div>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">Preferred help type</span>
        <select
          name="preferredHelpType"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          required
        >
          {helpTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">Message</span>
        <textarea
          name="message"
          rows={4}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="Share how you would like to help."
          required
        />
      </label>

      {error ? (
        <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading" || selectedNeeds.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "Sending..." : "Send Help Request"}
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
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}
