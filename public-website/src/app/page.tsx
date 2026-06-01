"use client";

import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DataNotice, LoadingState } from "@/components/common/DataState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { AnimatedWords } from "@/components/motion/AnimatedWords";
import { Reveal } from "@/components/motion/Reveal";
import { NeedCard } from "@/components/needs/NeedCard";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { useApprovedSchools } from "@/lib/api/hooks";

const howItWorks = [
  "Schools are listed with location, images, people served, and verification state.",
  "Needs are broken into exact support items with urgency, cost, and progress.",
  "Helpers submit a request and admin receives the selected school, needs, and contact details.",
];

export default function Home() {
  const { data, isLoading } = useApprovedSchools({ limit: 100, status: "approved" });
  const schools = data?.data ?? [];
  const allNeeds = schools.flatMap((school) => school.needs);
  const urgentNeeds = [...allNeeds]
    .filter((need) => need.status !== "Completed")
    .sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency))
    .slice(0, 3);
  const featuredSchools = schools.slice(0, 3);
  const stats = [
    { label: "Schools listed", value: schools.length, icon: <School /> },
    {
      label: "Students reached",
      value: schools.reduce((sum, school) => sum + school.totalStudents, 0),
      icon: <Users />,
    },
    {
      label: "Teachers supported",
      value: schools.reduce((sum, school) => sum + school.totalTeachers, 0),
      icon: <ShieldCheck />,
    },
    { label: "Active needs", value: allNeeds.length, icon: <HeartHandshake /> },
  ];

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950" />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <FloatingBadge className="left-[8%] top-[22%]" label="Water" />
          <FloatingBadge className="right-[10%] top-[28%]" label="Books" delay="-2s" />
          <FloatingBadge className="bottom-[18%] left-[18%]" label="Desks" delay="-4s" />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-emerald-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Verified welfare support across Nigeria
            </p>
          </Reveal>
          <AnimatedWords
            text="Help Schools & Madrasas Where Support Is Needed Most"
            className="mt-6 max-w-5xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={450}>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              Explore verified education profiles, see exact classroom needs, and
              offer support that reaches real students, teachers, and communities.
            </p>
          </Reveal>
          <Reveal delay={620}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Explore Schools Map <MapPin className="h-4 w-4" />
              </Link>
              <Link
                href="/needs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Sponsor a Need <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <DataNotice message={data?.message} />
        <div className="relative z-10 grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80}>
              <div className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] ring-1 ring-slate-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&_svg]:h-5 [&_svg]:w-5">
                  {stat.icon}
                </div>
                <p className="mt-4 text-3xl font-black text-slate-950">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <Reveal>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Map preview
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Support is visible by state, city, and exact school profile.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The full map uses OpenStreetMap, Leaflet, and marker clustering for
              many locations. Each marker opens a quick school card with a profile
              link.
            </p>
            <Link
              href="/map"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Open Interactive Map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
            <div className="absolute inset-6 rounded-[2rem] border border-emerald-200/70" />
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <LoadingState label="Loading schools from API..." />
              </div>
            ) : null}
            {schools.slice(0, 8).map((school, index) => (
              <Link
                key={school.id}
                href={`/schools/${school.id}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-[calc(50%+2px)] hover:text-emerald-700"
                style={{
                  left: `${18 + (index % 4) * 22}%`,
                  top: `${22 + Math.floor(index / 4) * 44 + (index % 2) * 8}%`,
                }}
              >
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
                {school.state}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Urgent needs"
            title="High-priority support requests"
            text="Choose a specific need and send admin your preferred way to help."
            action={
              <Link
                href="/needs"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-200 transition hover:bg-emerald-50"
              >
                View all needs <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {urgentNeeds.map((need, index) => (
              <Reveal key={need.id} delay={index * 90}>
                <NeedCard
                  need={need}
                  school={schools.find((school) => school.id === need.schoolId)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From verified profile to practical help"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Reveal key={item} delay={index * 90}>
              <article className="h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <span className="text-lg font-black">{index + 1}</span>
                </div>
                <p className="mt-5 leading-7 text-slate-700">{item}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured schools"
            title="Profiles ready for helpers"
            action={
              <Link
                href="/schools"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-200 transition hover:bg-emerald-50"
              >
                Browse schools <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {featuredSchools.map((school, index) => (
              <Reveal key={school.id} delay={index * 90}>
                <SchoolCard school={school} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="rounded-3xl bg-emerald-700 p-8 text-white shadow-[0_18px_50px_rgba(4,120,87,0.25)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-100" />
            <h2 className="mt-5 text-3xl font-black">Recent impact</h2>
            <p className="mt-4 leading-7 text-emerald-50">
              Library renovation, desk repairs, and teacher support are tracked
              as completed or partially funded projects in the mock impact layer.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
            <ShieldCheck className="h-10 w-10 text-blue-700" />
            <h2 className="mt-5 text-3xl font-black text-slate-950">
              Trust and transparency
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Badges show verification and urgency. Admin notifications include
              selected needs, donor details, message, and profile link for follow-up.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-6 py-12 text-center text-white sm:px-10">
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Help a school move from urgent need to completed support.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/needs"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Sponsor a Need <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function urgencyRank(urgency: string) {
  return { Critical: 0, High: 1, Medium: 2, Completed: 3 }[urgency] ?? 4;
}

function FloatingBadge({
  label,
  className,
  delay = "0s",
}: {
  label: string;
  className: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-emerald-100 backdrop-blur md:block ${className}`}
      style={{ animation: `floatY 9s ease-in-out infinite`, animationDelay: delay }}
    >
      {label}
    </div>
  );
}
