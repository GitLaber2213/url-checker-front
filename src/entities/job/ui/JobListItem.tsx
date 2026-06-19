import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LinkIcon from '@mui/icons-material/Link'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StatusBadge } from './StatusBadge'
import type { JobSummary } from '../model/types'

interface JobListItemProps {
  job: JobSummary
  isActive: boolean
  onSelect: (jobId: string) => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(iso))
}

export function JobListItem({ job, isActive, onSelect }: JobListItemProps) {
  const { stats } = job

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isActive ? 'primary.main' : 'divider',
        borderWidth: isActive ? 2 : 1,
        bgcolor: isActive ? 'action.selected' : 'background.paper',
      }}
    >
      <CardActionArea onClick={() => onSelect(job.id)}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            mb={0.5}
          >
            <Typography
              variant="caption"
              component="code"
              color="text.secondary"
              sx={{ fontFamily: 'monospace' }}
            >
              {job.id.slice(0, 8)}…
            </Typography>
            <StatusBadge status={job.status} />
          </Stack>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(job.createdAt)}
          </Typography>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption">{job.urlCount}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CheckCircleOutlineIcon
                sx={{ fontSize: 16, color: 'success.main' }}
              />
              <Typography variant="caption">{stats.success}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography variant="caption">{stats.error}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <HourglassEmptyIcon
                sx={{ fontSize: 16, color: 'warning.main' }}
              />
              <Typography variant="caption">
                {stats.pending + stats.inProgress}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
