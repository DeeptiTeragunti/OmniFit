import { useState } from 'react'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Alert } from '@mui/material'
import { addActivity } from '../services/api'
import { ACTIVITY_LABELS } from './ActivityCard'

function nowForInput() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const EMPTY_FORM = { type: 'RUNNING', duration: '', caloriesBurned: '', startTime: nowForInput() }

const ActivityFormDialog = ({ open, onClose, onAdded }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.duration || Number(form.duration) <= 0) next.duration = 'Enter a positive duration'
    if (form.caloriesBurned !== '' && Number(form.caloriesBurned) < 0) next.caloriesBurned = 'Cannot be negative'
    if (!form.startTime) next.startTime = 'Start time is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await addActivity({
        type: form.type,
        duration: Number(form.duration),
        caloriesBurned: form.caloriesBurned === '' ? null : Number(form.caloriesBurned),
        startTime: form.startTime,
      })
      setForm(EMPTY_FORM)
      onAdded()
      onClose()
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Could not save activity. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Log an activity</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField select label="Activity type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={form.duration}
              error={!!errors.duration}
              helperText={errors.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <TextField
              label="Calories burned"
              type="number"
              value={form.caloriesBurned}
              error={!!errors.caloriesBurned}
              helperText={errors.caloriesBurned}
              onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
            />
            <TextField
              label="Start time"
              type="datetime-local"
              value={form.startTime}
              error={!!errors.startTime}
              helperText={errors.startTime}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save activity'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default ActivityFormDialog
