import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSeconds(seconds: number) {
  if (Number.isNaN(seconds)) return null

  const date = new Date(0)
  date.setSeconds(seconds)
  const timeString = date.toISOString().substring(11, 19)

  return timeString
}

export function formatNumber(number: number) {
  let formatter = Intl.NumberFormat('en', { notation: 'compact' })

  return formatter.format(number)
}

export function humanFileSize(bytes: number) {
  const thresh = 1000

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let u = -1
  const r = 10

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bytes.toFixed(1) + ' ' + units[u]
}


export async function asyncTry<T, S extends any[]>(
  fn: (...args: S) => T,
  ...args: S
): Promise<[null, T] | [Error]> {
  try {
    const result = fn.apply(null, args)

    if (result.then) {
      return [null, await result]
    }

    return [null, result]
  } catch (e) {
    return [e]
  }
}
