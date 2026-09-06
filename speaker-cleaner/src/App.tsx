
import { useAudioEngine } from './hooks/useAudioEngine'
import { DeviceSelector } from './components/DeviceSelector'
import { CleaningModeSelector } from './components/CleaningModeSelector'
import { CleaningSession } from './components/CleaningSession'
import { Play } from 'lucide-react'
import './styles/main.css'

function App() {
  const {
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
  } = useAudioEngine()

  if (uiState === 'ERROR') {
    return (
      <div className="app-container app-centered">
        <div className="error-screen">
          <h2>Unable to start cleaning</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="primary-button" onClick={startCleaning}>Try Again</button>
            <button className="secondary-button" onClick={resetToReady}>Back</button>
          </div>
        </div>
      </div>
    )
  }

  if (uiState === 'COMPLETED') {
    return (
      <div className="app-container app-centered">
        <div className="completion-screen">
          <h2>Cleaning Complete</h2>
          <p>{modeLabels[mode].title} cleaning sequence finished.</p>
          <p className="completion-duration">{modeLabels[mode].duration} seconds</p>
          <div className="completion-actions">
            <button className="primary-button" onClick={resetToReady}>Done</button>
            <button className="secondary-button" onClick={startCleaning}>Run Again</button>
          </div>
        </div>
      </div>
    )
  }

  if (uiState === 'CLEANING' || uiState === 'STOPPING') {
    return (
      <div className="app-container">
        <CleaningSession 
          progress={progress} 
          deviceTitle={deviceLabels[device].title}
          onStop={stopCleaning}
          isStopping={uiState === 'STOPPING'}
        />
      </div>
    )
  }

  // IDLE or READY State (Configuration)
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Speaker Cleaner</h1>
        <p>Carefully generated sound patterns designed to help clear moisture and loose debris from speaker openings.</p>
      </header>

      <main className="app-main">
        <DeviceSelector 
          selectedDevice={device} 
          onDeviceChange={setDevice} 
          deviceLabels={deviceLabels}
        />
        
        <CleaningModeSelector 
          selectedMode={mode} 
          onModeChange={setMode} 
          modeLabels={modeLabels} 
        />
      </main>

      <footer className="app-footer">
        <div className="summary-bar">
          <div className="summary-details">
            <div className="summary-item">
              <span className="summary-label">Device:</span>
              <span className="summary-value">{deviceLabels[device].title}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Mode:</span>
              <span className="summary-value">{modeLabels[mode].title}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{modeLabels[mode].duration} sec</span>
            </div>
          </div>
          <button className="start-button" onClick={startCleaning}>
            <Play size={18} fill="currentColor" />
            Start Cleaning
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App