import { Box, Card, CardContent, Typography, Stack } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import TimerIcon from '@mui/icons-material/Timer'
import ChecklistIcon from '@mui/icons-material/Checklist'

const StatCard = ({ icon, label, value }) => (
  <Card sx={{ flex: 1, minWidth: 160 }}>
    <CardContent>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

const ActivityStats = ({ activities }) => {
  const totalActivities = activities.length
  const totalCalories = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0)
  const totalMinutes = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
      <StatCard icon={<ChecklistIcon />} label="Activities logged" value={totalActivities} />
      <StatCard icon={<LocalFireDepartmentIcon />} label="Calories burned" value={totalCalories.toLocaleString()} />
      <StatCard icon={<TimerIcon />} label="Minutes trained" value={totalMinutes} />
    </Stack>
  )
}

export default ActivityStats
