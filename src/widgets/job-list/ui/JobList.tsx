import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  JobListItem,
  useJobListView,
} from '@entities/job'

export function JobList() {
  const {
    jobs,
    page,
    totalPages,
    total,
    loading,
    error,
    activeJobId,
    setListPage,
    selectJob,
  } = useJobListView()

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Задания</Typography>
        {loading && jobs.length > 0 && (
          <CircularProgress size={20} aria-label="Обновление списка" />
        )}
      </Stack>

      {total > 0 && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Всего: {total}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && jobs.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Typography color="text.secondary">Заданий пока нет</Typography>
      ) : (
        <Stack spacing={1.5}>
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              isActive={job.id === activeJobId}
              onSelect={selectJob}
            />
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, nextPage) => setListPage(nextPage)}
            color="primary"
            size="small"
            disabled={loading}
          />
        </Box>
      )}
    </Paper>
  )
}
