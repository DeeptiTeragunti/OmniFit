import { useContext, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useDispatch, useSelector } from 'react-redux'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Chip, Box, Tooltip, Stack } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import { toggleTheme } from '../store/uiSlice'

const AppShell = () => {
  const { logOut } = useContext(AuthContext)
  const dispatch = useDispatch()
  const themeMode = useSelector((s) => s.ui.themeMode)
  const user = useSelector((s) => s.auth.user)
  const [anchorEl, setAnchorEl] = useState(null)

  const roles = user?.realm_access?.roles || []
  const isAdmin = roles.includes('ADMIN')
  const displayName = user?.given_name || user?.preferred_username || user?.email || 'You'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <FitnessCenterIcon color="primary" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          OmniFit
        </Typography>

        <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={() => dispatch(toggleTheme())}>
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>{initials}</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">{displayName}</Typography>
              {isAdmin && <Chip label="Admin" size="small" color="secondary" />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          {/* logOut() takes an optional state arg too - same event-as-state footgun as logIn */}
          <MenuItem onClick={() => logOut()}>Log out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default AppShell
