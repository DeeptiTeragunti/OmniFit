import { Box, Skeleton, Typography, Stack } from '@mui/material'
import { useNavigate } from 'react-router'
import ActivityCard from './ActivityCard'

const ActivityList = ({ activities, loading }) => {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={120} />
        ))}
      </Box>
    )
  }

  if (activities.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 8, color: 'text.secondary' }}>
        <Typography variant="h6">No activities yet</Typography>
        <Typography variant="body2">Log your first workout to get started.</Typography>
      </Stack>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} onClick={() => navigate(`/activities/${activity.id}`)} />
      ))}
    </Box>
  )
}

export default ActivityList
