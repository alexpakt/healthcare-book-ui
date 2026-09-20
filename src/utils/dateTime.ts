export function getMinDateTimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function isNotInFuture(datetimeLocalValue: string): boolean {
  if (!datetimeLocalValue) return false;
  return new Date(datetimeLocalValue).getTime() <= Date.now();
}
