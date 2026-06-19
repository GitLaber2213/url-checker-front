import { API_BASE } from '@shared/config/api'

function streamUrl(path: string): string {
  if (!API_BASE) {
    return `/api${path}`
  }
  return `${API_BASE}/api${path}`
}

export const jobsStreamApi = {
  jobUrl: (jobId: string) => streamUrl(`/jobs/${jobId}/events`),
}

export function parseSseData<T>(raw: string): T | null {
  try {
    const parsed = JSON.parse(raw) as T | { type: 'heartbeat' }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'type' in parsed &&
      parsed.type === 'heartbeat'
    ) {
      return null
    }
    return parsed as T
  } catch {
    return null
  }
}
