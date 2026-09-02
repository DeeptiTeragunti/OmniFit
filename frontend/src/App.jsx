import { useContext, useEffect, useMemo } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { setCredentials } from './store/authSlice'
import { buildTheme } from './theme/theme'
import AppShell from './components/AppShell'
import LoginScreen from './components/LoginScreen'
import DashboardPage from './pages/DashboardPage'
import ActivityDetail from './components/ActivityDetail'

function App() {
  const { token, tokenData, logIn } = useContext(AuthContext)
  const dispatch = useDispatch()
  const themeMode = useSelector((s) => s.ui.themeMode)
  const theme = useMemo(() => buildTheme(themeMode), [themeMode])

  useEffect(() => {
    if (token && tokenData) {
      dispatch(setCredentials({ token, user: tokenData }))
    }
  }, [token, tokenData, dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!token ? (
        <LoginScreen onLogin={logIn} />
      ) : (
        <Router>
          <AppShell />
          <Routes>
            <Route path="/activities" element={<DashboardPage />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/" element={<Navigate to="/activities" replace />} />
            <Route path="*" element={<Navigate to="/activities" replace />} />
          </Routes>
        </Router>
      )}
    </ThemeProvider>
  )
}

export default App
