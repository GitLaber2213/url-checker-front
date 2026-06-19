import LinkIcon from '@mui/icons-material/Link'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { CreateJobForm } from '@features/create-job'
import { useJobsSse } from '@features/poll-jobs'
import { JobDetail } from '@widgets/job-detail'
import { JobList } from '@widgets/job-list'

export function MainPage() {
  useJobsSse()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <LinkIcon sx={{ mr: 1.5 }} />
          <Box>
            <Typography variant="h6" component="h1">
              URL Checker
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Асинхронная проверка доступности URL через HEAD-запросы
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 360px) 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3}>
            <CreateJobForm />
            <JobList />
          </Stack>

          <JobDetail />
        </Box>
      </Container>
    </Box>
  )
}
