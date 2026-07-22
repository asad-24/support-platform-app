export * from "@app/lib/format";

export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export function initials(nameOrEmail: string | null | undefined) {
  const value = nameOrEmail || "School Support Atlas";
  const parts = value.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
