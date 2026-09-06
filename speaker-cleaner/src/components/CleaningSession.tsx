import { ProgressUpdate } from '../hooks/useAudioEngine'
import { Square } from 'lucide-react'

interface CleaningSessionProps {
  progress: ProgressUpdate | null
  deviceTitle: string
  onStop: () => void
  isStopping: boolean
}

export function CleaningSession({ progress, deviceTitle, onStop, isStopping }: CleaningSessionProps) {
  // Format the time as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const remaining = progress ? progress.remaining_secs : 0
  const overallProgressPercent = progress ? Math.round(progress.progress * 100) : 0
  const currentPattern = progress ? progress.current_pattern : 'Starting...'
  
  let freqDisplay = '...'
  if (progress && progress.current_frequency_hz !== null) {
    if (progress.current_frequency_hz >= 1000) {
      freqDisplay = `${(progress.current_frequency_hz / 1000).toFixed(1)} kHz`
    } else {
      freqDisplay = `${Math.round(progress.current_frequency_hz)} Hz`
    }
  }

  return (
    <div className="cleaning-session">
      <div className="session-header">
        <h2 className="session-title">CLEANING SPEAKER</h2>
        <div className="session-timer">{formatTime(remaining)}</div>
        <div className="session-progress-bar-container">
          <div 
            className="session-progress-bar-fill" 
            style={{ width: `${overallProgressPercent}%` }}
          />
        </div>
        <div className="session-progress-text">{overallProgressPercent}% complete</div>
      </div>

      <div className="session-details">
        <div className="session-detail-group">
          <span className="detail-label">CURRENT PATTERN</span>
          <span className="detail-value">{currentPattern}</span>
        </div>
        
        <div className="session-detail-group">
          <span className="detail-label">FREQUENCY</span>
          <span className="detail-value freq-value">{freqDisplay}</span>
        </div>

        <div className="session-status">
          <div className="status-indicator" />
          <span>AUDIO PLAYING • {deviceTitle.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="session-visualizer">
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay-1"></div>
        <div className="pulse-ring delay-2"></div>
      </div>

      <button 
        className="stop-button" 
        onClick={onStop}
        disabled={isStopping}
      >
        <Square size={16} fill="currentColor" />
        <span>STOP CLEANING</span>
      </button>
    </div>
  )
}
