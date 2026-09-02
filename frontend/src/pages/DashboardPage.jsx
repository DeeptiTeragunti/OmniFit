import { useCallback, useEffect, useState } from 'react'
import { Box, Fab, Typography, Snackbar, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { getActivities } from '../services/api'
import ActivityStats from '../components/ActivityStats'
import ActivityList from '../components/ActivityList'
import ActivityFormDialog from '../components/ActivityFormDialog'

const DashboardPage = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getActivities()
      setActivities(res.data)
    } catch {
      setError('Could not load your activities.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 3 }, pb: 10 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your activity
      </Typography>
      <ActivityStats activities={activities} />
      <ActivityList activities={activities} loading={loading} />

      <Fab color="primary" onClick={() => setDialogOpen(true)} sx={{ position: 'fixed', bottom: 32, right: 32 }}>
        <AddIcon />
      </Fab>

      <ActivityFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdded={fetchActivities} />

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DashboardPage
