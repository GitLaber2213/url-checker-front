import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import {
  StatusBadge,
  UrlRow,
  useActiveJobView,
} from '@entities/job'
import { CancelJobButton } from '@features/cancel-job'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(iso))
}

export function JobDetail() {
  const {
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
  } = useActiveJobView()

  if (!activeJobId) {
    return (
      <Paper sx={{ p: 3, minHeight: 320 }}>
        <Typography variant="h6" gutterBottom>
          Детали задания
        </Typography>
        <Typography color="text.secondary">
          Выберите задание из списка или создайте новое
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        mb={2}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Детали задания
          </Typography>
          <Typography
            variant="caption"
            component="code"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
          >
            {activeJobId}
          </Typography>
        </Box>
        {status && <StatusBadge status={status} size="medium" />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(loading || waitingForStream) && !detail ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {createdAt && (
            <Stack spacing={1} mb={2}>
              <Typography variant="body2" color="text.secondary">
                Создано: {formatDate(createdAt)}
              </Typography>
              {detail?.proxy && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                >
                  Прокси: {detail.proxy}
                </Typography>
              )}
              {urlTotal > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Обработано {processedCount} из {urlTotal}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </Stack>
          )}

          <CancelJobButton />

          {detail ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>URL</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>HTTP</TableCell>
                    <TableCell>Ошибка</TableCell>
                    <TableCell>Длительность</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.urls.map((url) => (
                    <UrlRow key={url.url} url={url} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            !loading &&
            !waitingForStream && (
              <Typography color="text.secondary">
                Не удалось загрузить список URL
              </Typography>
            )
          )}
        </>
      )}
    </Paper>
  )
}
