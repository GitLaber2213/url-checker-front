import { useCallback, useState, type FormEvent } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useJobsStore } from '@entities/job'
import { parseUrls } from '@shared/lib/parseUrls'

export function CreateJobForm() {
  const loading = useJobsStore((state) => state.createLoading)
  const error = useJobsStore((state) => state.createError)
  const clearCreateError = useJobsStore((state) => state.clearCreateError)
  const createJob = useJobsStore((state) => state.createJob)
  const [value, setValue] = useState('')
  const [proxy, setProxy] = useState('')

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      clearCreateError()

      const urls = parseUrls(value)
      if (urls.length === 0) {
        return
      }

      const jobId = await createJob(urls, proxy.trim() || undefined)
      if (jobId) {
        setValue('')
      }
    },
    [clearCreateError, createJob, proxy, value],
  )

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Новое задание</Typography>

        <TextField
          id="urls"
          label="URL для проверки"
          placeholder={'https://example.com\nhttps://httpbin.org/status/404'}
          helperText="По одному URL на строку"
          multiline
          minRows={6}
          fullWidth
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={loading}
        />

        <TextField
          id="proxy"
          label="Прокси (необязательно)"
          placeholder="socks5://user:password@162.19.247.245:44550"
          helperText="SOCKS5, SOCKS4, HTTP или HTTPS. Без прокси — прямое подключение"
          fullWidth
          value={proxy}
          onChange={(event) => setProxy(event.target.value)}
          disabled={loading}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            disabled={loading || parseUrls(value).length === 0}
          >
            {loading ? 'Создание…' : 'Запустить проверку'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}
