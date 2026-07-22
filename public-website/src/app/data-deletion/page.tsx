import { AlertCircle, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PolicyRequestForm } from "@/components/forms/PolicyRequestForm";

const deletionSteps = [
  "Submit the request form with the email used in the Android app or website.",
  "The admin team verifies account ownership before deleting or anonymizing account data.",
  "Associated account data is deleted unless retention is required for security, audit, legal, fraud prevention, or verified school record integrity.",
  "A confirmation is sent to the email address provided after the request is processed.",
];

export default function DataDeletionPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Data deletion"
            title="Request account and data deletion"
            text="Use this page to request deletion of a School Support Atlas account and associated personal data."
          />
          <div className="space-y-4">
            {deletionSteps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-700">
                    {index + 1}
                  </div>
                  <p className="leading-7 text-slate-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-100">
            <AlertCircle className="h-5 w-5" />
            <p className="mt-2 text-sm leading-6">
              School profile records may remain visible when they are approved public records and no longer identify the requesting user.
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            <p className="mt-3 font-black text-slate-950">Web deletion request link</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This public page can be used as the Google Play account deletion URL for the Android app.
            </p>
          </div>
          <PolicyRequestForm
            subjectPrefix="Account and data deletion request"
            messageLabel="Deletion request details"
            messagePlaceholder="Tell us which account or records you want deleted. Include any school or volunteer details that help identify the record."
            successMessage="Deletion request sent. The admin team will review and contact you."
            includeAccountFields
          />
        </div>
      </section>
    </main>
  );
}
