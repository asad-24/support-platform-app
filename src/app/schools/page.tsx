"use client";

import { DataNotice, LoadingState } from "@/components/common/DataState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SchoolsListing } from "@/components/schools/SchoolsListing";
import { useApprovedSchools } from "@/lib/api/hooks";

export default function SchoolsPage() {
  const { data, isLoading } = useApprovedSchools({ limit: 100, status: "approved" });
  const schools = data?.data ?? [];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Schools and madrasas"
          title="Verified profiles ready for support"
          text="Browse schools by name, location, and type. Each profile keeps needs, contact points, and verification details together."
        />
        <DataNotice message={data?.message} />
        {isLoading ? <LoadingState label="Loading approved schools from API..." /> : null}
        <Reveal>
          <SchoolsListing schools={schools} />
        </Reveal>
      </section>
    </main>
  );
}
