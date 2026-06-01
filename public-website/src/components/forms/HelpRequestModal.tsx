"use client";

import { X } from "lucide-react";
import { HelpRequestForm } from "@/components/forms/HelpRequestForm";
import type { School } from "@/lib/types";

export function HelpRequestModal({
  open,
  onClose,
  school,
  initialNeedIds = [],
}: {
  open: boolean;
  onClose: () => void;
  school: School;
  initialNeedIds?: string[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Help request
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {school.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <HelpRequestForm
            school={school}
            initialNeedIds={initialNeedIds}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}
