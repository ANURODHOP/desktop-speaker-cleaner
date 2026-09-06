import React from 'react'
import { Volume2, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface StatusDisplayProps {
  isPlaying: boolean
  progress: { progress: number; remaining_secs: number; current_pattern: string } | null
  error: string | null
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  isPlaying,
  progress,
  error,
}) => {
  if (error) {
    return (
      <div className="status-display status-display--error">
        <AlertCircle size={20} className="status-display__icon" />
        <span className="status-display__text">Error: {error}</span>
      </div>
    )
  }

  if (isPlaying && progress) {
    return (
      <div className="status-display status-display--playing">
        <Loader2 size={20} className="status-display__icon status-display__icon--spin" />
        <span className="status-display__text">
          Playing: {progress.current_pattern} ({Math.round(progress.progress * 100)}%)
        </span>
      </div>
    )
  }

  if (!isPlaying && progress && progress.progress >= 1) {
    return (
      <div className="status-display status-display--complete">
        <CheckCircle size={20} className="status-display__icon" />
        <span className="status-display__text">Cleaning completed successfully</span>
      </div>
    )
  }

  return (
    <div className="status-display status-display--idle">
      <Volume2 size={20} className="status-display__icon" />
      <span className="status-display__text">Ready to clean</span>
    </div>
  )
}