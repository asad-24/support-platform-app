"use client";

import { CheckCircle2, HandCoins, School, ShieldCheck } from "lucide-react";
import { DataNotice, LoadingState } from "@/components/common/DataState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { useApprovedSchools } from "@/lib/api/hooks";

const impact = [
  ["Mini library renovated", "Hope Primary School Ibadan", "260 pupils gained reading access"],
  ["Desk repair campaign", "Bright Path Community School", "26 desks funded in phase one"],
  ["Teacher support bridge", "Al-Falah Madrasa", "2 volunteer teachers sponsored"],
];

export default function ImpactPage() {
  const { data, isLoading } = useApprovedSchools({ limit: 100, status: "approved" });
  const schools = data?.data ?? [];
  const needs = schools.flatMap((school) => school.needs);
  const verifiedCount = schools.filter(
    (school) => school.verificationStatus === "Verified",
  ).length;
  const completedCount = needs.filter(
    (need) => need.status === "Completed" || need.status === "Funded",
  ).length;

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Impact"
          title="Transparent progress from request to completed support"
          text="This page is ready for real project updates once the admin backend is connected."
        />
        <DataNotice message={data?.message} />
        {isLoading ? <LoadingState label="Loading impact data from API..." /> : null}
        <div className="grid gap-5 md:grid-cols-4">
          <Stat icon={<School />} value={String(schools.length)} label="Listed schools" />
          <Stat icon={<ShieldCheck />} value={String(verifiedCount)} label="Verified locations" />
          <Stat icon={<HandCoins />} value={String(needs.length)} label="Active needs" />
          <Stat icon={<CheckCircle2 />} value={String(completedCount)} label="Completed actions" />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {impact.map(([title, school, result], index) => (
            <Reveal key={title} delay={index * 90}>
              <article className="h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-700" />
                <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm font-bold text-blue-700">{school}</p>
                <p className="mt-3 leading-7 text-slate-600">{result}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
