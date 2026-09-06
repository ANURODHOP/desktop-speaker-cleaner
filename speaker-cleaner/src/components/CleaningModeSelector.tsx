
import { CleaningMode } from '../hooks/useAudioEngine'

interface CleaningModeSelectorProps {
  selectedMode: CleaningMode
  onModeChange: (mode: CleaningMode) => void
  disabled?: boolean
  modeLabels: Record<CleaningMode, { title: string; description: string; duration: number }>
}

export function CleaningModeSelector({
  selectedMode,
  onModeChange,
  disabled,
  modeLabels,
}: CleaningModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h2 className="section-title">Select Mode</h2>
      <div className="mode-options">
        {(Object.entries(modeLabels) as [CleaningMode, typeof modeLabels[CleaningMode]][]).map(
          ([mode, { title, description, duration }]) => (
            <button
              key={mode}
              className={`mode-card ${selectedMode === mode ? 'active' : ''}`}
              onClick={() => onModeChange(mode)}
              disabled={disabled}
            >
              <div className="mode-header">
                <h3>{title}</h3>
                <span className="mode-duration">{duration}s</span>
              </div>
              <p>{description}</p>
            </button>
          )
        )}
      </div>
    </div>
  )
}