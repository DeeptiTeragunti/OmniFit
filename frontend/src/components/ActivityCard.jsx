import { Card, CardActionArea, CardContent, Typography, Box, Chip, Stack } from '@mui/material'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import PoolIcon from '@mui/icons-material/Pool'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement'
import BoltIcon from '@mui/icons-material/Bolt'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics'

const ICONS = {
  RUNNING: DirectionsRunIcon,
  WALKING: DirectionsWalkIcon,
  CYCLING: DirectionsBikeIcon,
  SWIMMING: PoolIcon,
  WEIGHT_TRAINING: FitnessCenterIcon,
  YOGA: SelfImprovementIcon,
  HIIT: BoltIcon,
  CARDIO: FavoriteIcon,
  STRETCHING: AccessibilityNewIcon,
  OTHER: SportsGymnasticsIcon,
}

export const ACTIVITY_LABELS = {
  RUNNING: 'Running',
  WALKING: 'Walking',
  CYCLING: 'Cycling',
  SWIMMING: 'Swimming',
  WEIGHT_TRAINING: 'Weight Training',
  YOGA: 'Yoga',
  HIIT: 'HIIT',
  CARDIO: 'Cardio',
  STRETCHING: 'Stretching',
  OTHER: 'Other',
}

const ActivityCard = ({ activity, onClick }) => {
  const Icon = ICONS[activity.type] || SportsGymnasticsIcon
  return (
    <Card>
      <CardActionArea onClick={onClick} sx={{ height: '100%', p: 0.5 }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {ACTIVITY_LABELS[activity.type] || activity.type}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip size="small" label={`${activity.duration} min`} />
            {activity.caloriesBurned != null && <Chip size="small" label={`${activity.caloriesBurned} cal`} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {new Date(activity.startTime).toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ActivityCard
