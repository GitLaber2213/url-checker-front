import { create } from 'zustand'
import { jobsApi } from '@shared/api'
import type { JobDetail, JobSummary } from './types'
import {
  buildDetailCacheFromList,
  countProcessedFromStats,
  countProcessedUrls,
  detailFromSummary,
  getJobStatusFromState,
  JOBS_PAGE_SIZE,
  parseJobDetail,
  shouldCloseJobStream,
  shouldStartJobStream,
  summaryFromDetail,
} from './types'

export interface JobsState {
  list: JobSummary[]
  listPage: number
  listLimit: number
  listTotal: number
  listTotalPages: number
  listLoading: boolean
  listError: string | null
  activeJobId: string | null
  streamJobId: string | null
  activeJobDetail: JobDetail | null
  detailCache: Record<string, JobDetail>
  detailLoading: boolean
  detailError: string | null
  createLoading: boolean
  createError: string | null
  cancelLoading: boolean
  cancelError: string | null
}

interface JobsActions {
  loadJobs: (page?: number) => Promise<void>
  setListPage: (page: number) => void
  applyJobUpdate: (detail: JobDetail | JobSummary) => void
  setDetailError: (message: string | null) => void
  createJob: (urls: string[], proxy?: string) => Promise<string | null>
  cancelJob: (jobId: string) => Promise<void>
  selectJob: (jobId: string) => void
  clearCreateError: () => void
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function calcTotalPages(total: number, limit: number): number {
  return total > 0 ? Math.ceil(total / limit) : 0
}

function upsertJobSummary(list: JobSummary[], job: JobSummary): JobSummary[] {
  const index = list.findIndex((item) => item.id === job.id)
  if (index === -1) {
    return [job, ...list]
  }
  const next = [...list]
  next[index] = job
  return next
}

function prependJobSummary(
  list: JobSummary[],
  job: JobSummary,
  limit: number,
): JobSummary[] {
  return [job, ...list.filter((item) => item.id !== job.id)].slice(0, limit)
}

function cacheDetail(
  cache: Record<string, JobDetail>,
  detail: JobDetail,
): Record<string, JobDetail> {
  return { ...cache, [detail.id]: detail }
}

function resolveJobDetail(
  state: JobsState,
  jobId: string,
): JobDetail | null {
  return (
    state.detailCache[jobId] ??
    (() => {
      const summary = state.list.find((job) => job.id === jobId)
      return summary ? detailFromSummary(summary) : null
    })()
  )
}

export const useJobsStore = create<JobsState & JobsActions>((set, get) => ({
  list: [],
  listPage: 1,
  listLimit: JOBS_PAGE_SIZE,
  listTotal: 0,
  listTotalPages: 0,
  listLoading: false,
  listError: null,
  activeJobId: null,
  streamJobId: null,
  activeJobDetail: null,
  detailCache: {},
  detailLoading: false,
  detailError: null,
  createLoading: false,
  createError: null,
  cancelLoading: false,
  cancelError: null,

  selectJob: (jobId) => {
    if (get().activeJobId === jobId) {
      return
    }

    const state = get()
    const detail = resolveJobDetail(state, jobId)
    const summary = state.list.find((job) => job.id === jobId)
    const isActive =
      summary?.status === 'pending' || summary?.status === 'in_progress'
    const resolvedDetail =
      detail ?? (summary ? detailFromSummary(summary) : null)
    const streamJobId = shouldStartJobStream(summary, resolvedDetail)
      ? jobId
      : null

    set({
      activeJobId: jobId,
      streamJobId,
      activeJobDetail: detail,
      detailError: null,
      detailLoading: detail == null && isActive,
    })
  },

  clearCreateError: () => {
    set({ createError: null })
  },

  loadJobs: async (page = get().listPage) => {
    set({ listLoading: true, listError: null, listPage: page })

    try {
      const response = await jobsApi.listJobs(page, get().listLimit)

      set({
        listLoading: false,
        list: response.items,
        listPage: response.page,
        listLimit: response.limit,
        listTotal: response.total,
        listTotalPages: response.totalPages,
        detailCache: buildDetailCacheFromList(response.items, get().detailCache),
      })
    } catch (error) {
      set({
        listLoading: false,
        listError: getErrorMessage(error, 'Failed to load jobs'),
      })
    }
  },

  setListPage: (page) => {
    void get().loadJobs(page)
  },

  applyJobUpdate: (rawDetail: JobDetail | JobSummary) => {
    const detail = parseJobDetail(rawDetail)
    const summary = summaryFromDetail(detail)

    set((state) => {
      const inList = state.list.some((job) => job.id === detail.id)
      const listTotal = inList ? state.listTotal : state.listTotal + 1
      const list =
        inList || state.listPage !== 1
          ? upsertJobSummary(state.list, summary)
          : prependJobSummary(state.list, summary, state.listLimit)
      const streamDone =
        state.streamJobId === detail.id && shouldCloseJobStream(detail)

      return {
        detailLoading: false,
        detailError: null,
        streamJobId: streamDone ? null : state.streamJobId,
        detailCache: cacheDetail(state.detailCache, detail),
        activeJobDetail:
          state.activeJobId === detail.id ? detail : state.activeJobDetail,
        list,
        listTotal,
        listTotalPages: calcTotalPages(listTotal, state.listLimit),
      }
    })
  },

  setDetailError: (message) => {
    set({
      detailError: message,
      detailLoading: false,
      streamJobId: message ? null : get().streamJobId,
    })
  },

  createJob: async (urls, proxy) => {
    set({ createLoading: true, createError: null })
    try {
      const { jobId } = await jobsApi.createJob({ urls, proxy })
      const pendingUrls = urls.map((url) => ({ url, status: 'pending' as const }))
      const optimisticDetail: JobDetail = {
        id: jobId,
        createdAt: new Date().toISOString(),
        status: 'pending',
        proxy: proxy?.trim() || null,
        urls: pendingUrls,
      }

      const summary = summaryFromDetail(optimisticDetail)

      set((state) => {
        const listTotal = state.listTotal + 1

        return {
          createLoading: false,
          activeJobId: jobId,
          streamJobId: jobId,
          activeJobDetail: optimisticDetail,
          detailLoading: false,
          detailCache: cacheDetail(state.detailCache, optimisticDetail),
          listPage: 1,
          list:
            state.listPage === 1
              ? prependJobSummary(state.list, summary, state.listLimit)
              : [summary],
          listTotal,
          listTotalPages: calcTotalPages(listTotal, state.listLimit),
        }
      })
      return jobId
    } catch (error) {
      set({
        createLoading: false,
        createError: getErrorMessage(error, 'Failed to create job'),
      })
      return null
    }
  },

  cancelJob: async (jobId) => {
    set({ cancelLoading: true, cancelError: null })
    try {
      const raw = await jobsApi.cancelJob(jobId)
      const detail = parseJobDetail(raw)
      set((state) => ({
        cancelLoading: false,
        streamJobId: state.streamJobId === jobId ? null : state.streamJobId,
        detailCache: cacheDetail(state.detailCache, detail),
        activeJobDetail:
          state.activeJobId === jobId ? detail : state.activeJobDetail,
        list: state.list.some((job) => job.id === jobId)
          ? upsertJobSummary(state.list, summaryFromDetail(detail))
          : state.list,
      }))
    } catch (error) {
      set({
        cancelLoading: false,
        cancelError: getErrorMessage(error, 'Failed to cancel job'),
      })
    }
  },
}))

export const selectActiveJobSummaryStatus = (state: JobsState) =>
  getJobStatusFromState(state)

export const selectShouldStreamActiveJob = (state: JobsState) =>
  state.streamJobId != null && state.streamJobId === state.activeJobId

export const selectActiveJobListCreatedAt = (state: JobsState) => {
  if (!state.activeJobId) {
    return null
  }
  return state.list.find((job) => job.id === state.activeJobId)?.createdAt ?? null
}

export const selectActiveJobProcessedCount = (state: JobsState) => {
  const detail =
    state.activeJobDetail ??
    (state.activeJobId ? state.detailCache[state.activeJobId] : null)

  if (detail) {
    return countProcessedUrls(detail)
  }

  const summary = state.list.find((job) => job.id === state.activeJobId)
  if (!summary) {
    return 0
  }

  return countProcessedFromStats(summary.stats)
}

export const selectActiveJobUrlTotal = (state: JobsState) => {
  const detail =
    state.activeJobDetail ??
    (state.activeJobId ? state.detailCache[state.activeJobId] : null)

  if (detail) {
    return detail.urls.length
  }

  return state.list.find((job) => job.id === state.activeJobId)?.urlCount ?? 0
}
