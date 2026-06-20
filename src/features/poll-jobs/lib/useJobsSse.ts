import { useEffect, useRef } from 'react'
import {
  parseJobDetail,
  shouldCloseJobStream,
  useJobsStore,
  type JobDetail,
  type JobSummary,
} from '@entities/job'
import { jobsStreamApi, parseSseData } from '@shared/api/jobsStreamApi'

let currentSource: EventSource | null = null
let currentSourceJobId: string | null = null

function stopJobStream() {
  if (currentSource) {
    currentSource.close()
    currentSource = null
    currentSourceJobId = null
  }
}

function connectJobStream(jobId: string) {
  if (currentSourceJobId === jobId && currentSource) {
    return
  }

  stopJobStream()

  const source = new EventSource(jobsStreamApi.jobUrl(jobId))
  currentSource = source
  currentSourceJobId = jobId

  let closed = false

  const close = () => {
    if (closed) {
      return
    }
    closed = true
    source.close()
    if (currentSource === source) {
      currentSource = null
      currentSourceJobId = null
    }
  }

  source.onmessage = (event) => {
    if (closed) {
      return
    }

    const data = parseSseData<JobDetail | JobSummary>(event.data)
    if (!data) {
      return
    }

    useJobsStore.getState().applyJobUpdate(data)

    if (shouldCloseJobStream(parseJobDetail(data))) {
      close()
    }
  }

  source.onerror = () => {
    close()
  }
}

export function useJobsSse() {
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const streamJobId = useJobsStore((state) => state.streamJobId)
  const loadJobs = useJobsStore((state) => state.loadJobs)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) {
      return
    }
    initRef.current = true
    void loadJobs(1)
  }, [loadJobs])

  useEffect(() => {
    if (!streamJobId || streamJobId !== activeJobId) {
      stopJobStream()
      return
    }

    connectJobStream(streamJobId)

    return stopJobStream
  }, [activeJobId, streamJobId])
}
