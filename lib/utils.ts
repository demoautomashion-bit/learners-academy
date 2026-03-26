import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSecureToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous O, 0, I, 1
  let token = 'LA-'
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  token += '-'
  for (let i = 0; i < 2; i++) {
    token += Math.floor(Math.random() * 10).toString()
  }
  return token
}
