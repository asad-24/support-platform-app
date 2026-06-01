"use client";

import { DataNotice, LoadingState } from "@/components/common/DataState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { NeedCard } from "@/components/needs/NeedCard";
import { useApprovedSchools } from "@/lib/api/hooks";

export default function NeedsPage() {
  const { data, isLoading } = useApprovedSchools({ limit: 100, status: "approved" });
  const schools = data?.data ?? [];
  const allNeeds = schools.flatMap((school) =>
    school.needs.map((need) => ({ need, school })),
  );

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Sponsor a need"
          title="Choose specific classroom, water, food, and teacher needs"
          text="Every need is attached to a school profile so admin can follow up with the helper and local contact."
        />
        <DataNotice message={data?.message} />
        {isLoading ? <LoadingState label="Loading needs from API..." /> : null}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allNeeds.map(({ need, school }, index) => (
            <Reveal key={need.id} delay={(index % 3) * 90}>
              <NeedCard need={need} school={school} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
