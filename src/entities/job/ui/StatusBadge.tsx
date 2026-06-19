import Chip from '@mui/material/Chip'
import type { ChipProps } from '@mui/material/Chip'
import type { JobStatus, UrlStatus } from '../model/types'

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'В процессе',
  completed: 'Завершено',
  cancelled: 'Отменено',
  failed: 'Ошибка',
}

const URL_STATUS_LABELS: Record<UrlStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'Проверяется',
  success: 'Успех',
  error: 'Ошибка',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<
  JobStatus | UrlStatus,
  ChipProps['color']
> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  success: 'success',
  cancelled: 'default',
  failed: 'error',
  error: 'error',
}

interface StatusBadgeProps {
  status: JobStatus | UrlStatus
  variant?: 'job' | 'url'
  size?: ChipProps['size']
}

export function StatusBadge({
  status,
  variant = 'job',
  size = 'small',
}: StatusBadgeProps) {
  const label =
    variant === 'url'
      ? URL_STATUS_LABELS[status as UrlStatus]
      : JOB_STATUS_LABELS[status as JobStatus]

  return (
    <Chip
      label={label}
      color={STATUS_COLORS[status]}
      size={size}
      variant="filled"
    />
  )
}
