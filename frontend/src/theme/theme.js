import { createTheme } from '@mui/material/styles'

const shape = { borderRadius: 12 }

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 700 },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
}

const components = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 10, paddingInline: 18 },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
}

export function buildTheme(mode) {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: '#14B8A6', contrastText: '#062B27' },
      secondary: { main: '#F97316' },
      background: {
        default: isDark ? '#0B1120' : '#F8FAFC',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      success: { main: '#22C55E' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
    },
    shape,
    typography,
    components,
  })
}
