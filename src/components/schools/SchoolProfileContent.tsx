"use client";

import {
  CalendarDays,
  GraduationCap,
  Home,
  MapPin,
  School as SchoolIcon,
  Users,
} from "lucide-react";
import { DataNotice, LoadingState } from "@/components/common/DataState";
import { Badge } from "@/components/common/Badge";
import { SectionHeading } from "@/components/common/SectionHeading";
import { NeedCard } from "@/components/needs/NeedCard";
import { HelpThisSchoolButton } from "@/components/schools/HelpThisSchoolButton";
import { useApprovedSchool } from "@/lib/api/hooks";

export function SchoolProfileContent({ id }: { id: string }) {
  const { data, isLoading } = useApprovedSchool(id);
  const school = data?.data;

  if (isLoading) {
    return (
      <main className="bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <LoadingState label="Loading school profile from API..." />
        </section>
      </main>
    );
  }

  if (!school) {
    return (
      <main className="bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200">
            <h1 className="text-3xl font-black text-slate-950">School not found</h1>
            <p className="mt-2 text-slate-600">The API did not return this profile.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DataNotice message={data?.message} />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
            <div className="relative h-[420px] overflow-hidden">
              <img
                src={school.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap gap-2">
                  <Badge label={school.verificationStatus} />
                  <Badge label={school.type} />
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                  {school.name}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-white/85">
                  <MapPin className="h-5 w-5" />
                  {school.address}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {school.images.slice(0, 3).map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-28 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
          <aside className="self-start rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 lg:sticky lg:top-24">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Profile details
            </p>
            <p className="mt-4 leading-7 text-slate-600">{school.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ProfileMetric icon={<Users />} label="Students" value={school.totalStudents} />
              <ProfileMetric icon={<GraduationCap />} label="Teachers" value={school.totalTeachers} />
              <ProfileMetric icon={<SchoolIcon />} label="Classrooms" value={school.totalClassrooms} />
              <ProfileMetric icon={<Home />} label="Founded" value={school.foundedYear} />
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                Last updated {new Date(school.lastUpdated).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Local contact: {school.contactPerson}
              </p>
            </div>
            <div className="mt-6">
              <HelpThisSchoolButton school={school} />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Needs list"
          title="Current support priorities"
          text="Choose one need or support multiple needs from this school profile."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {school.needs.map((need) => (
            <NeedCard key={need.id} need={need} school={school} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProfileMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}
