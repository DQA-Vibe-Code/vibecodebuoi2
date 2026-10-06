/** yyyy-mm-dd → dd/mm/yyyy */
export function formatDate(value: string): string {
  if (!value) return "—"
  const [y, m, d] = value.split("-")
  return y && m && d ? `${d}/${m}/${y}` : value
}

export function formatDateTime(ms: number | null): string {
  if (ms === null) return "—"
  return new Date(ms).toLocaleString("vi-VN")
}
