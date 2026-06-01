import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { getNeedProgress } from "@/lib/data/schools";
import type { School } from "@/lib/types";

export function SchoolCard({ school }: { school: School }) {
  const urgentNeed =
    school.needs.find((need) => need.urgency === "Critical") ?? school.needs[0];

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
      <Link href={`/schools/${school.id}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <img
            src={school.images[0]}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge label={school.verificationStatus} />
            <Badge label={school.type} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-black leading-tight">{school.name}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/85">
              <MapPin className="h-4 w-4" />
              {school.city}, {school.state}
            </p>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <Metric icon={<Users />} label="Students" value={school.totalStudents} />
          <Metric
            icon={<GraduationCap />}
            label="Teachers"
            value={school.totalTeachers}
          />
          <Metric
            icon={<BookOpen />}
            label="Rooms"
            value={school.totalClassrooms}
          />
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Main urgent need
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">{urgentNeed.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {getNeedProgress(urgentNeed)}% funded
              </p>
            </div>
            <Badge label={urgentNeed.urgency} />
          </div>
        </div>
        <Link
          href={`/schools/${school.id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700 transition hover:text-blue-700"
        >
          View Profile <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}
