const rawBase = import.meta.env.VITE_API_URL ?? ''

export const API_BASE = rawBase.replace(/\/$/, '')
