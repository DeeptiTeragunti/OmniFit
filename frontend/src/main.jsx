import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { AuthProvider } from 'react-oauth2-code-pkce'
import { Box, CircularProgress } from '@mui/material'
import { store } from './store/store'
import { authConfig } from './authConfig'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider
        authConfig={authConfig}
        loadingComponent={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <CircularProgress />
          </Box>
        }
      >
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
