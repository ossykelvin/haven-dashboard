import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDisplayDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const date = new Date(trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string) {
  const date = parseDisplayDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function formatDateTime(value: string) {
  const date = parseDisplayDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function initials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
