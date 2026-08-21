import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd")
}

export function formatDisplayDate(dateStr: string): string {
  try { return format(parseISO(dateStr), "EEEE, MMMM d") }
  catch { return dateStr }
}

export function daysUntil(dateStr: string): number {
  try { return Math.max(0, differenceInDays(parseISO(dateStr), new Date())) }
  catch { return 0 }
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getDayStatusColor(status: string): string {
  switch (status) {
    case "excellent": return "bg-emerald-500"
    case "good": return "bg-blue-500"
    case "average": return "bg-yellow-500"
    case "poor": return "bg-red-500"
    default: return "bg-zinc-700"
  }
}