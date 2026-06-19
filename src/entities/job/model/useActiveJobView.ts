import {
  selectActiveJobListCreatedAt,
  selectActiveJobProcessedCount,
  selectActiveJobSummaryStatus,
  selectActiveJobUrlTotal,
  selectShouldStreamActiveJob,
  useJobsStore,
} from './store'

export function useActiveJobView() {
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const detail = useJobsStore((state) => state.activeJobDetail)
  const summaryStatus = useJobsStore(selectActiveJobSummaryStatus)
  const summaryCreatedAt = useJobsStore(selectActiveJobListCreatedAt)
  const processedCount = useJobsStore(selectActiveJobProcessedCount)
  const urlTotal = useJobsStore(selectActiveJobUrlTotal)
  const shouldStream = useJobsStore(selectShouldStreamActiveJob)
  const loading = useJobsStore((state) => state.detailLoading)
  const error = useJobsStore((state) => state.detailError)

  const status = detail?.status ?? summaryStatus
  const createdAt = detail?.createdAt ?? summaryCreatedAt
  const progressValue = urlTotal > 0 ? (processedCount / urlTotal) * 100 : 0
  const waitingForStream = shouldStream && !detail

  return {
    activeJobId,
    detail,
    status,
    createdAt,
    processedCount,
    urlTotal,
    progressValue,
    loading,
    error,
    waitingForStream,
  }
}
