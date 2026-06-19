import type {
  JobStatsDto,
  JobSummaryDto,
  UrlResultDto,
} from '@shared/api/jobsTypes'
import { JOBS_PAGE_SIZE } from '@shared/api/jobsTypes'

export type JobStatus = JobSummaryDto['status']
export type UrlStatus = UrlResultDto['status']
export type JobStats = JobStatsDto
export type UrlResult = UrlResultDto
export type JobSummary = JobSummaryDto

export interface JobDetail {
  id: string
  createdAt: string
  status: JobStatus
  proxy?: string | null
  urls: UrlResult[]
}

export { JOBS_PAGE_SIZE }

export const TERMINAL_JOB_STATUSES: JobStatus[] = [
  'completed',
  'cancelled',
  'failed',
]

export function isTerminalJobStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status)
}

export function countProcessedUrls(job: JobDetail): number {
  return job.urls.filter((url) =>
    ['success', 'error', 'cancelled'].includes(url.status),
  ).length
}

export function areAllUrlStatusesKnown(job: JobDetail): boolean {
  return job.urls.every((url) =>
    ['success', 'error', 'cancelled'].includes(url.status),
  )
}

export function shouldCloseJobStream(detail: JobDetail): boolean {
  return isTerminalJobStatus(detail.status) || areAllUrlStatusesKnown(detail)
}

export function countProcessedFromStats(stats: JobStats): number {
  return stats.success + stats.error + stats.cancelled
}

type JobDetailSource = {
  id: string
  createdAt: string
  status: JobStatus
  proxy?: string | null
  urls?: UrlResult[]
  jobs?: UrlResult[]
}

export function parseJobDetail(source: JobDetailSource): JobDetail {
  return {
    id: source.id,
    createdAt: source.createdAt,
    status: source.status,
    proxy: source.proxy ?? null,
    urls: source.urls ?? source.jobs ?? [],
  }
}

export function detailFromSummary(summary: JobSummary): JobDetail {
  return parseJobDetail(summary)
}

export function summaryFromDetail(detail: JobDetail): JobSummary {
  const stats: JobStats = {
    success: 0,
    error: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0,
  }

  for (const url of detail.urls) {
    switch (url.status) {
      case 'success':
        stats.success += 1
        break
      case 'error':
        stats.error += 1
        break
      case 'pending':
        stats.pending += 1
        break
      case 'in_progress':
        stats.inProgress += 1
        break
      case 'cancelled':
        stats.cancelled += 1
        break
    }
  }

  return {
    id: detail.id,
    createdAt: detail.createdAt,
    status: detail.status,
    urlCount: detail.urls.length,
    proxy: detail.proxy ?? null,
    jobs: detail.urls,
    stats,
  }
}

export function buildDetailCacheFromList(
  list: JobSummary[],
  existing: Record<string, JobDetail> = {},
): Record<string, JobDetail> {
  const cache = { ...existing }

  for (const summary of list) {
    cache[summary.id] = detailFromSummary(summary)
  }

  return cache
}

export function getJobStatusFromState(
  state: {
    activeJobId: string | null
    activeJobDetail: JobDetail | null
    detailCache: Record<string, JobDetail>
    list: JobSummary[]
  },
): JobStatus | null {
  if (!state.activeJobId) {
    return null
  }

  return (
    state.activeJobDetail?.status ??
    state.detailCache[state.activeJobId]?.status ??
    state.list.find((job) => job.id === state.activeJobId)?.status ??
    null
  )
}
