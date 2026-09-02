import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    themeMode: localStorage.getItem('themeMode') || 'light',
  },
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', state.themeMode)
    },
  },
})

export const { toggleTheme } = uiSlice.actions
export default uiSlice.reducer
