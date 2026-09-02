import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Box, Card, CardContent, Typography, Stack, IconButton, Skeleton, Alert } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getActivity, getActivityRecommendation } from '../services/api'
import RecommendationPanel from './RecommendationPanel'
import { ACTIVITY_LABELS } from './ActivityCard'

const MAX_POLLS = 20
const POLL_INTERVAL_MS = 5000

/**
 * v1's equivalent page called the /recommendations/activity/{id} endpoint and treated
 * its response as if it were the activity itself - the activity's own type/duration/
 * calories never actually got fetched, so they silently rendered as undefined. This
 * fetches the activity and the recommendation separately, since they're different
 * resources with different lifecycles (the recommendation may not exist yet).
 */
const ActivityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [polling, setPolling] = useState(true)
  const pollCount = useRef(0)

  useEffect(() => {
    let cancelled = false
    getActivity(id)
      .then((res) => !cancelled && setActivity(res.data))
      .catch(() => !cancelled && setLoadError('Could not load this activity.'))
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    let timer

    const tryFetch = async () => {
      try {
        const res = await getActivityRecommendation(id)
        if (!cancelled) {
          setRecommendation(res.data)
          setPolling(false)
        }
        return
      } catch (err) {
        if (err.response?.status !== 404) {
          if (!cancelled) setPolling(false)
          return
        }
      }
      pollCount.current += 1
      if (pollCount.current >= MAX_POLLS) {
        if (!cancelled) setPolling(false)
        return
      }
      timer = setTimeout(tryFetch, POLL_INTERVAL_MS)
    }

    tryFetch()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [id])

  if (loadError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {loadError}
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <IconButton onClick={() => navigate('/activities')} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      {!activity ? (
        <Skeleton variant="rounded" height={140} sx={{ mb: 3 }} />
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {ACTIVITY_LABELS[activity.type] || activity.type}
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mt: 1 }}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="h6">{activity.duration} min</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Calories
                </Typography>
                <Typography variant="h6">{activity.caloriesBurned ?? '-'}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  When
                </Typography>
                <Typography variant="h6">{new Date(activity.startTime).toLocaleDateString()}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <RecommendationPanel recommendation={recommendation} pending={polling && !recommendation} />
    </Box>
  )
}

export default ActivityDetail
