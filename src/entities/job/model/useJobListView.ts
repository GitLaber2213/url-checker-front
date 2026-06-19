import { useJobsStore } from './store'

export function useJobListView() {
  const jobs = useJobsStore((state) => state.list)
  const page = useJobsStore((state) => state.listPage)
  const totalPages = useJobsStore((state) => state.listTotalPages)
  const total = useJobsStore((state) => state.listTotal)
  const loading = useJobsStore((state) => state.listLoading)
  const error = useJobsStore((state) => state.listError)
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const setListPage = useJobsStore((state) => state.setListPage)
  const selectJob = useJobsStore((state) => state.selectJob)

  return {
    jobs,
    page,
    totalPages,
    total,
    loading,
    error,
    activeJobId,
    setListPage,
    selectJob,
  }
}
