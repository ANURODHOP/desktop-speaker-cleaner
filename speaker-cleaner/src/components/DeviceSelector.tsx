
import { DeviceType } from '../hooks/useAudioEngine'
import { Laptop, Speaker as SpeakerIcon, Headphones } from 'lucide-react'

interface DeviceSelectorProps {
  selectedDevice: DeviceType
  onDeviceChange: (device: DeviceType) => void
  disabled?: boolean
  deviceLabels: Record<DeviceType, { title: string; description: string }>
}

export function DeviceSelector({ selectedDevice, onDeviceChange, disabled, deviceLabels }: DeviceSelectorProps) {
  return (
    <div className="device-selector">
      <h2 className="section-title">Select Speaker</h2>
      <div className="device-options">
        <button
          className={`device-card ${selectedDevice === 'laptop' ? 'active' : ''}`}
          onClick={() => onDeviceChange('laptop')}
          disabled={disabled}
        >
          <Laptop className="device-icon" />
          <div className="device-info">
            <h3>{deviceLabels.laptop.title}</h3>
            <p>{deviceLabels.laptop.description}</p>
          </div>
        </button>

        <button
          className={`device-card ${selectedDevice === 'external' ? 'active' : ''}`}
          onClick={() => onDeviceChange('external')}
          disabled={disabled}
        >
          <SpeakerIcon className="device-icon" />
          <div className="device-info">
            <h3>{deviceLabels.external.title}</h3>
            <p>{deviceLabels.external.description}</p>
          </div>
        </button>

        <button
          className={`device-card ${selectedDevice === 'airpods' ? 'active' : ''}`}
          onClick={() => onDeviceChange('airpods')}
          disabled={disabled}
        >
          <Headphones className="device-icon" />
          <div className="device-info">
            <h3>{deviceLabels.airpods.title}</h3>
            <p>{deviceLabels.airpods.description}</p>
          </div>
        </button>
      </div>
      
      {selectedDevice === 'airpods' && (
        <div className="device-warning">
          <strong>Warning:</strong> Remove earbuds from your ears before starting. Cleaning tones can be loud and are not intended for playback directly into the ear.
        </div>
      )}
      
      {selectedDevice !== 'airpods' && (
        <div className="device-note">
          Playback uses your current Windows audio output.
        </div>
      )}
    </div>
  )
}
