import Link from '@mui/material/Link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { StatusBadge } from './StatusBadge'
import type { UrlResult } from '../model/types'

interface UrlRowProps {
  url: UrlResult
}

function formatDuration(ms?: number): string {
  if (ms == null) {
    return '—'
  }
  if (ms < 1000) {
    return `${ms} ms`
  }
  return `${(ms / 1000).toFixed(1)} s`
}

export function UrlRow({ url }: UrlRowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ maxWidth: 320 }}>
        <Link
          href={url.url}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={{ wordBreak: 'break-all' }}
        >
          {url.url}
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={url.status} variant="url" />
      </TableCell>
      <TableCell>{url.httpStatus ?? '—'}</TableCell>
      <TableCell sx={{ maxWidth: 240 }}>
        <Typography
          variant="body2"
          color={url.errorMessage ? 'error' : 'text.secondary'}
          sx={{ wordBreak: 'break-word' }}
        >
          {url.errorMessage ?? '—'}
        </Typography>
      </TableCell>
      <TableCell>{formatDuration(url.durationMs)}</TableCell>
    </TableRow>
  )
}
