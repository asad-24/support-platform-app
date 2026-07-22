"use client";

import { HeartHandshake } from "lucide-react";
import { useState } from "react";
import { HelpRequestModal } from "@/components/forms/HelpRequestModal";
import type { School } from "@/lib/types";

export function HelpThisSchoolButton({
  school,
  label = "Sponsor This School",
}: {
  school: School;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
      >
        <HeartHandshake className="h-4 w-4" />
        {label}
      </button>
      <HelpRequestModal
        open={open}
        onClose={() => setOpen(false)}
        school={school}
      />
    </>
  );
}
