import { Box, Button, Typography, Stack } from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'

const LoginScreen = ({ onLogin }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 2,
      bgcolor: 'background.default',
    }}
  >
    <Stack spacing={3} alignItems="center" sx={{ maxWidth: 420 }}>
      <Box
        sx={{
          p: 2,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
        }}
      >
        <FitnessCenterIcon fontSize="large" />
      </Box>
      <Typography variant="h4">OmniFit</Typography>
      <Typography variant="body1" color="text.secondary">
        Track your workouts and get AI-powered recommendations tailored to every session.
      </Typography>
      {/* logIn() takes an optional state argument - onClick={onLogin} would pass the click
          event itself as that argument, which the library then tries to serialize and
          crashes on (circular reference via the React Fiber tree). Call it with no args. */}
      <Button variant="contained" size="large" onClick={() => onLogin()} sx={{ px: 5, py: 1.2 }}>
        Sign in
      </Button>
    </Stack>
  </Box>
)

export default LoginScreen
