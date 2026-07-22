"use client";

import { HeartHandshake } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { HelpRequestModal } from "@/components/forms/HelpRequestModal";
import {
  formatCurrency,
  getNeedProgress,
  getSchoolById,
} from "@/lib/data/schools";
import type { Need, School } from "@/lib/types";

export function NeedCard({ need, school: schoolProp }: { need: Need; school?: School }) {
  const [open, setOpen] = useState(false);
  const school = schoolProp ?? getSchoolById(need.schoolId);
  const progress = getNeedProgress(need);

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,118,110,0.14)]">
        <div className="relative h-44 overflow-hidden">
          <img
            src={need.images[0]}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge label={need.urgency} />
            <Badge label={need.status} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            {need.category}
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{need.title}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {school?.name} {school ? `- ${school.city}, ${school.state}` : ""}
          </p>
          <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
            {need.description}
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{formatCurrency(need.estimatedCost)}</span>
              <span>{progress}% funded</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <HeartHandshake className="h-4 w-4" />
            Sponsor This Need
          </button>
        </div>
      </article>
      {school ? (
        <HelpRequestModal
          open={open}
          onClose={() => setOpen(false)}
          school={school}
          initialNeedIds={[need.id]}
        />
      ) : null}
    </>
  );
}
