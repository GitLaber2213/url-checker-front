export type JobStatusDto =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type UrlStatusDto =
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'error'
  | 'cancelled'

export interface JobStatsDto {
  success: number
  error: number
  pending: number
  inProgress: number
  cancelled: number
}

export interface UrlResultDto {
  url: string
  status: UrlStatusDto
  httpStatus?: number
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
  durationMs?: number
}

export interface JobSummaryDto {
  id: string
  createdAt: string
  status: JobStatusDto
  urlCount: number
  proxy?: string | null
  jobs: UrlResultDto[]
  stats: JobStatsDto
}

export interface CreateJobRequestDto {
  urls: string[]
  proxy?: string
}

export interface CreateJobResponseDto {
  jobId: string
}

export interface JobsPageResponseDto {
  items: JobSummaryDto[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const JOBS_PAGE_SIZE = 35

export type JobUpdateDto = JobSummaryDto & {
  urls?: UrlResultDto[]
}
