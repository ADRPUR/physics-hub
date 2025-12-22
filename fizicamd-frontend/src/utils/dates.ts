export function formatHumanDate(
  value?: string | null,
  locale?: string
): string | undefined {
  if (!value) return undefined;
  try {
    const formatter = new Intl.DateTimeFormat(locale ?? "ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return formatter.format(new Date(value));
  } catch (err) {
    console.warn("Failed to format date", err);
    return undefined;
  }
}
