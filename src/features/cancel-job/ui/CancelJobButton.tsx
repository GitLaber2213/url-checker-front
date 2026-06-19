import { useCallback } from 'react'
import CancelIcon from '@mui/icons-material/Cancel'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import {
  selectActiveJobSummaryStatus,
  useJobsStore,
} from '@entities/job'

export function CancelJobButton() {
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const detailStatus = useJobsStore(
    (state) => state.activeJobDetail?.status ?? null,
  )
  const summaryStatus = useJobsStore(selectActiveJobSummaryStatus)
  const status = detailStatus ?? summaryStatus ?? null
  const loading = useJobsStore((state) => state.cancelLoading)
  const error = useJobsStore((state) => state.cancelError)
  const cancelJob = useJobsStore((state) => state.cancelJob)

  const canCancel =
    activeJobId != null &&
    (status === 'pending' || status === 'in_progress')

  const handleCancel = useCallback(() => {
    if (!activeJobId) {
      return
    }
    void cancelJob(activeJobId)
  }, [activeJobId, cancelJob])

  if (!canCancel) {
    return null
  }

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="outlined"
        color="error"
        startIcon={<CancelIcon />}
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? 'Отмена…' : 'Отменить задание'}
      </Button>
    </Stack>
  )
}
