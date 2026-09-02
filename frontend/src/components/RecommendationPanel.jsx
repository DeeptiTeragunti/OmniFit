import { Card, CardContent, Typography, Divider, Stack, List, ListItem, ListItemText, CircularProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import ShieldIcon from '@mui/icons-material/Shield'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

const Section = ({ icon, title, items }) => {
  if (!items || items.length === 0) return null
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      <List dense disablePadding sx={{ mb: 2 }}>
        {items.map((item, i) => (
          <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', display: 'list-item', listStyleType: 'disc', ml: 3, py: 0.25 }}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </>
  )
}

const RecommendationPanel = ({ recommendation, pending }) => {
  if (pending) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={22} />
            <Stack>
              <Typography variant="subtitle1">Generating your AI recommendation</Typography>
              <Typography variant="body2" color="text.secondary">
                This can take up to a minute - checking again shortly.
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (!recommendation) return null

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6">AI Recommendation</Typography>
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
          {recommendation.recommendation}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Section icon={<TipsAndUpdatesIcon color="warning" fontSize="small" />} title="Improvements" items={recommendation.improvements} />
        <Section icon={<CheckCircleIcon color="success" fontSize="small" />} title="Suggestions" items={recommendation.suggestions} />
        <Section icon={<ShieldIcon color="error" fontSize="small" />} title="Safety" items={recommendation.safety} />
      </CardContent>
    </Card>
  )
}

export default RecommendationPanel
