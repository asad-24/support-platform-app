export function DataNotice({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
      {message}
    </div>
  );
}

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
      <p className="mt-4 text-sm font-black text-slate-600">{label}</p>
    </div>
  );
}
