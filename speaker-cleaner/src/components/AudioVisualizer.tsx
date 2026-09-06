import React from 'react'

interface AudioVisualizerProps {
  isPlaying: boolean
  progress: { progress: number; pattern_progress: number } | null
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  progress,
}) => {
  const bars = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className={`audio-visualizer ${isPlaying ? 'audio-visualizer--active' : ''}`} aria-hidden="true">
      <div className="audio-visualizer__bars">
        {bars.map((i) => {
          const delay = i * 0.05
          const baseHeight = isPlaying ? 8 + Math.random() * 32 : 4
          const progressFactor = progress ? progress.pattern_progress : 0
          
          return (
            <div
              key={i}
              className="audio-visualizer__bar"
              style={{
                height: isPlaying ? `${baseHeight}px` : '4px',
                animationDelay: `${delay}s`,
                opacity: isPlaying ? 0.5 + progressFactor * 0.5 : 0.3,
              }}
            />
          )
        })}
      </div>
      <div className="audio-visualizer__wave">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity={isPlaying ? 0.6 : 0.2} />
              <stop offset="50%" stopColor="currentColor" stopOpacity={isPlaying ? 0.4 : 0.1} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={isPlaying ? 0.6 : 0.2} />
            </linearGradient>
          </defs>
          <path
            d={isPlaying 
              ? "M0,20 Q25,10 50,20 T100,20 T150,20 T200,20" 
              : "M0,20 Q25,19 50,20 T100,20 T150,20 T200,20"
            }
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth={isPlaying ? 2 : 1}
            className={isPlaying ? 'audio-visualizer__wave-path--active' : ''}
          />
        </svg>
      </div>
    </div>
  )
}