import {
  parseJobDetail,
  shouldCloseJobStream,
  useJobsStore,
  type JobDetail,
  type JobSummary,
} from '@entities/job'
import { jobsStreamApi, parseSseData } from '@shared/api/jobsStreamApi'

let abortController: AbortController | null = null
let connectedJobId: string | null = null

function parseSseBlocks(buffer: string): { events: string[]; rest: string } {
  const events: string[] = []
  let rest = buffer

  while (true) {
    const separatorIndex = rest.indexOf('\n\n')
    if (separatorIndex === -1) {
      break
    }

    const block = rest.slice(0, separatorIndex)
    rest = rest.slice(separatorIndex + 2)

    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.replace(/^data:\s?/, ''))
      .join('\n')

    if (data) {
      events.push(data)
    }
  }

  return { events, rest }
}

function handleStreamEvent(raw: string): boolean {
  const data = parseSseData<JobDetail | JobSummary>(raw)
  if (!data) {
    return false
  }

  useJobsStore.getState().applyJobUpdate(data)
  return shouldCloseJobStream(parseJobDetail(data))
}

async function readJobStream(jobId: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(jobsStreamApi.jobUrl(jobId), {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
    },
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error(`SSE request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const parsed = parseSseBlocks(buffer)
      buffer = parsed.rest

      for (const event of parsed.events) {
        if (handleStreamEvent(event)) {
          return
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function stopJobStream(): void {
  abortController?.abort()
  abortController = null
  connectedJobId = null
}

export function syncJobStream(
  streamJobId: string | null,
  activeJobId: string | null,
): void {
  const targetJobId =
    streamJobId && streamJobId === activeJobId ? streamJobId : null

  if (targetJobId === connectedJobId) {
    return
  }

  stopJobStream()

  if (!targetJobId) {
    return
  }

  connectedJobId = targetJobId
  abortController = new AbortController()

  void readJobStream(targetJobId, abortController.signal)
    .catch((error: unknown) => {
      if (abortController?.signal.aborted) {
        return
      }

      connectedJobId = null
      abortController = null

      const message =
        error instanceof Error ? error.message : 'SSE connection failed'
      useJobsStore.getState().setDetailError(message)
    })
    .finally(() => {
      if (connectedJobId !== targetJobId) {
        return
      }

      connectedJobId = null
      abortController = null
    })
}
