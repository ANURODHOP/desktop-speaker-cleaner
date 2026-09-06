import React from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

export type CleaningMode = 'quick' | 'balanced' | 'deep'
export type DeviceType = 'laptop' | 'external' | 'airpods'
export type UIState = 'IDLE' | 'READY' | 'CLEANING' | 'STOPPING' | 'COMPLETED' | 'ERROR'

export interface ProgressUpdate {
  progress: number
  current_pattern: string
  pattern_progress: number
  remaining_secs: number
  current_frequency_hz: number | null
}

const modeLabels: Record<CleaningMode, { title: string; description: string; duration: number }> = {
  quick: { title: 'Quick', description: 'Short low-frequency pulse sequence.', duration: 30 },
  balanced: { title: 'Balanced', description: 'Low-frequency pulses followed by a controlled frequency sweep.', duration: 50 },
  deep: { title: 'Deep', description: 'Multi-stage cleaning sequence covering low, low-mid and mid frequencies.', duration: 80 },
}

const deviceLabels: Record<DeviceType, { title: string; description: string }> = {
  laptop: { title: 'Laptop Speaker', description: 'Built-in laptop speakers' },
  external: { title: 'External Speaker', description: 'USB, AUX or Bluetooth speakers' },
  airpods: { title: 'AirPods / Earbuds', description: 'Left / right earbud playback' }
}

export function useAudioEngine() {
  const [uiState, setUiState] = React.useState<UIState>('IDLE')
  const [mode, setModeState] = React.useState<CleaningMode>('balanced')
  const [device, setDeviceState] = React.useState<DeviceType>('laptop')
  
  const [progress, setProgress] = React.useState<ProgressUpdate | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let unlistenProgress: UnlistenFn | undefined
    let unlistenComplete: UnlistenFn | undefined

    const setupListeners = async () => {
      unlistenProgress = await listen<ProgressUpdate>('cleaning-progress', (event) => {
        setProgress(event.payload)
      })

      unlistenComplete = await listen('cleaning-complete', () => {
        setUiState('COMPLETED')
      })
    }

    setupListeners()

    invoke<CleaningMode>('get_mode')
      .then((m) => {
        setModeState(m)
        setUiState('READY')
      })
      .catch(() => {})

    return () => {
      if (unlistenProgress) unlistenProgress()
      if (unlistenComplete) unlistenComplete()
    }
  }, [])

  const startCleaning = async () => {
    if (uiState === 'CLEANING' || uiState === 'STOPPING') return
    
    setError(null)
    setProgress(null)
    setUiState('CLEANING')
    
    try {
      await invoke('start_cleaning')
    } catch (err) {
      setError(err as string)
      setUiState('ERROR')
    }
  }

  const stopCleaning = async () => {
    if (uiState !== 'CLEANING') return
    
    setUiState('STOPPING')
    setError(null)
    
    try {
      await invoke('stop_cleaning')
      setProgress(null)
      setUiState('READY')
    } catch (err) {
      setError(err as string)
      setUiState('ERROR')
    }
  }

  const setMode = async (newMode: CleaningMode) => {
    if (uiState === 'CLEANING' || uiState === 'STOPPING') return
    
    setError(null)
    try {
      await invoke('set_mode', { mode: newMode })
      setModeState(newMode)
      if (uiState === 'COMPLETED' || uiState === 'ERROR') {
        setUiState('READY')
      }
    } catch (err) {
      setError(err as string)
      setUiState('ERROR')
    }
  }

  const setDevice = (newDevice: DeviceType) => {
    if (uiState === 'CLEANING' || uiState === 'STOPPING') return
    setDeviceState(newDevice)
    if (uiState === 'COMPLETED' || uiState === 'ERROR') {
      setUiState('READY')
    }
  }

  const resetToReady = () => {
    setUiState('READY')
    setProgress(null)
    setError(null)
  }

  return {
    uiState,
    mode,
    device,
    progress,
    error,
    startCleaning,
    stopCleaning,
    setMode,
    setDevice,
    resetToReady,
    modeLabels,
    deviceLabels,
  }
}