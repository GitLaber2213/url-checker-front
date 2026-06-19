import { useEffect, useRef } from 'react'
import {
  parseJobDetail,
  selectShouldStreamActiveJob,
  shouldCloseJobStream,
  useJobsStore,
  type JobDetail,
  type JobSummary,
} from '@entities/job'
import { jobsStreamApi, parseSseData } from '@shared/api/jobsStreamApi'

export function useJobsSse() {
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const shouldStream = useJobsStore(selectShouldStreamActiveJob)
  const loadJobs = useJobsStore((state) => state.loadJobs)
  const applyJobUpdate = useJobsStore((state) => state.applyJobUpdate)
  const setDetailError = useJobsStore((state) => state.setDetailError)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) {
      return
    }
    initRef.current = true
    void loadJobs(1)
  }, [loadJobs])

  useEffect(() => {
    if (!activeJobId || !shouldStream) {
      return
    }

    const source = new EventSource(jobsStreamApi.jobUrl(activeJobId))
    let closed = false

    source.onmessage = (event) => {
      if (closed) {
        return
      }

      const data = parseSseData<JobDetail | JobSummary>(event.data)
      if (!data) {
        return
      }

      applyJobUpdate(data)

      if (shouldCloseJobStream(parseJobDetail(data))) {
        closed = true
        source.close()
      }
    }

    source.onerror = () => {
      if (closed) {
        return
      }
      closed = true
      source.close()
      setDetailError('Потеряно SSE-соединение с заданием')
    }

    return () => {
      closed = true
      source.close()
    }
  }, [activeJobId, applyJobUpdate, setDetailError, shouldStream])
}
