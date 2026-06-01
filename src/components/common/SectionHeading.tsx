import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h2>
        {text ? <p className="mt-3 text-base leading-7 text-slate-600">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}
