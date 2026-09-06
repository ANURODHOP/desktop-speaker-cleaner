import React from 'react'
import { Play, Square, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'

interface CleaningControlProps {
  isPlaying: boolean
  progress: { progress: number; remaining_secs: number; current_pattern: string } | null
  onStart: () => void
  onStop: () => void
  error: string | null
}

export const CleaningControl: React.FC<CleaningControlProps> = ({
  isPlaying,
  progress,
  onStart,
  onStop,
  error,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isComplete = progress && progress.progress >= 1.0 && !isPlaying

  if (error) {
    return (
      <div className="cleaning-control cleaning-control--error">
        <AlertCircle size={24} className="cleaning-control__error-icon" />
        <span className="cleaning-control__error-text">{error}</span>
        <button className="cleaning-control__dismiss" onClick={() => window.location.reload()}>
          <RotateCcw size={16} />
        </button>
      </div>
    )
  }

  if (!isPlaying && !isComplete) {
    return (
      <button
        className="cleaning-control__start"
        onClick={onStart}
        type="button"
      >
        <Play size={24} className="cleaning-control__icon" />
        <span className="cleaning-control__text">Start Cleaning</span>
      </button>
    )
  }

  if (isPlaying && progress) {
    return (
      <div className="cleaning-control cleaning-control--active">
        <div className="cleaning-control__progress-wrapper">
          <div className="cleaning-control__progress-bar">
            <div
              className="cleaning-control__progress-fill"
              style={{ width: `${(progress.progress * 100).toFixed(1)}%` }}
            />
          </div>
          <div className="cleaning-control__progress-info">
            <span className="cleaning-control__pattern">
              {progress.current_pattern}
            </span>
            <span className="cleaning-control__time">
              {formatTime(progress.remaining_secs)} remaining
            </span>
          </div>
        </div>
        <button
          className="cleaning-control__stop"
          onClick={onStop}
          type="button"
        >
          <Square size={20} className="cleaning-control__icon" />
          <span className="cleaning-control__text">Stop Cleaning</span>
        </button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="cleaning-control cleaning-control--complete">
        <CheckCircle size={24} className="cleaning-control__success-icon" />
        <span className="cleaning-control__success-text">Cleaning Complete</span>
        <button
          className="cleaning-control__restart"
          onClick={onStart}
          type="button"
        >
          <RotateCcw size={20} />
          <span>Clean Again</span>
        </button>
      </div>
    )
  }

  return (
    <button
      className="cleaning-control__start"
      onClick={onStart}
      type="button"
    >
      <Play size={24} className="cleaning-control__icon" />
      <span className="cleaning-control__text">Start Cleaning</span>
    </button>
  )
}