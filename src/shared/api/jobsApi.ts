import type {
  CreateJobRequestDto,
  CreateJobResponseDto,
  JobSummaryDto,
  JobsPageResponseDto,
} from './jobsTypes'
import { JOBS_PAGE_SIZE } from './jobsTypes'
import { request } from './client'

export const jobsApi = {
  createJob(payload: CreateJobRequestDto, signal?: AbortSignal) {
    const body: CreateJobRequestDto = { urls: payload.urls }
    const proxy = payload.proxy?.trim()
    if (proxy) {
      body.proxy = proxy
    }

    return request<CreateJobResponseDto>('/jobs', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    })
  },

  listJobs(page = 1, limit = JOBS_PAGE_SIZE, signal?: AbortSignal) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return request<JobsPageResponseDto>(`/jobs?${params.toString()}`, { signal })
  },

  cancelJob(jobId: string, signal?: AbortSignal) {
    return request<JobSummaryDto>(`/jobs/${jobId}`, {
      method: 'DELETE',
      signal,
    })
  },
}
