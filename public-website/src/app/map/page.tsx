"use client";

import { MapPin } from "lucide-react";
import { DataNotice, LoadingState } from "@/components/common/DataState";
import { MapSection } from "@/components/map/MapSection";
import { useApprovedSchools } from "@/lib/api/hooks";

export default function MapPage() {
  const { data, isLoading } = useApprovedSchools({ limit: 100, status: "approved" });
  const schools = data?.data ?? [];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            <MapPin className="h-4 w-4" />
            Nigeria school map
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Find verified schools and madrasas by location and need.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Explore verified education welfare needs across Nigeria with clustered
            markers, practical filters, and profile links for each location.
          </p>
        </div>
        <DataNotice message={data?.message} />
        {isLoading ? <LoadingState label="Loading map schools from API..." /> : null}
        <MapSection schools={schools} />
      </section>
    </main>
  );
}
