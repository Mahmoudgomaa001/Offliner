import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSeconds(seconds: number) {
  const date = new Date(0)
  date.setSeconds(seconds)
  const timeString = date.toISOString().substring(11, 19)

  return timeString
}

export function formatNumber(number: number) {
  let formatter = Intl.NumberFormat('en', { notation: 'compact' })

  return formatter.format(number)
}
