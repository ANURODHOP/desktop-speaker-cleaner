# 🔊 Speaker Cleaner

A Windows desktop application that generates controlled audio patterns to help clear moisture and loose debris from speaker openings.

This is my first desktop application, built to learn and experiment with **Rust, Tauri, React, and programmatic audio generation**.

> Speaker Cleaner does not guarantee removal of water or physical debris and is not a replacement for hardware repair.

## ✨ Features

- 🖥️ Windows desktop application
- 🔊 Programmatically generated cleaning audio
- 💧 Low-frequency water-ejection pattern
- 🌊 Controlled frequency sweep
- 🎵 Multi-stage deep cleaning sequence
- ⏱️ Real-time cleaning timer and progress
- 📊 Current cleaning pattern and frequency information
- 🛑 Dedicated cleaning session with a Stop control
- 🎧 Support for laptop speakers, external/normal speakers, and AirPods/earbuds
- ⚡ No external MP3 files required
- 🔒 UI controls are locked while cleaning is active
- 🦀 Rust-powered audio backend
- ⚛️ React frontend
- 🪟 Tauri desktop runtime

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript / TypeScript
- HTML / CSS

### Desktop
- Tauri 2

### Backend
- Rust
- Rodio

### Serialization / Error Handling
- Serde
- Serde JSON
- Thiserror

## 🧠 How It Works

Speaker Cleaner does not rely on downloaded audio files. The cleaning sounds are generated directly by the Rust backend using audio signal generators.

```text
React Frontend
      │
      │ Tauri Commands / Events
      ▼
Rust Backend
      │
      ▼
AudioEngine
      │
      ├── CleaningMode
      │
      ├── CleaningPattern
      │
      └── Audio Sources
             │
             ├── WaterEjectSource
             ├── DustSweepSource
             └── FullSpectrumSource
                    │
                    ▼
              Rodio / Audio Output
```

## 🎚️ Cleaning Modes

### Quick
**Duration:** 30 seconds

```text
Water Eject
```

A short, controlled low-frequency sequence.

### Balanced
**Duration:** 50 seconds

```text
Water Eject
      ↓
Dust Sweep
```

Combines the low-frequency pulse sequence with a controlled frequency sweep.

### Deep
**Duration:** 80 seconds

```text
Water Eject
      ↓
Dust Sweep
      ↓
Full Spectrum
```

Deep mode uses multiple controlled stages rather than simply increasing the volume.

## 🎵 Audio Generation

The application generates audio samples programmatically in Rust.

The audio sources operate at:

```text
44,100 Hz
```

### Water Eject

The water-ejection pattern uses a fundamental frequency around:

```text
165 Hz
```

It also contains controlled harmonics and a pulsed envelope.

```text
Fundamental
+
2nd harmonic
+
3rd harmonic
```

The fundamental remains dominant while harmonic components are kept at lower levels.

### Dust Sweep

The dust sweep uses a logarithmic frequency sweep approximately covering:

```text
200 Hz → 4000 Hz
```

The oscillator uses phase accumulation so that the phase remains continuous while the frequency changes.

```text
200 Hz
  ↓
  ↓
1000 Hz
  ↓
  ↓
4000 Hz
```

The sweep also uses controlled harmonics and a pulsed envelope.

### Full Spectrum

Deep cleaning uses a staged frequency sequence:

```text
Stage 1:
120 Hz → 300 Hz

Stage 2:
300 Hz → 1200 Hz

Stage 3:
1200 Hz → 3000 Hz

Stage 4:
3000 Hz → 180 Hz
```

Each stage uses frequency sweep, controlled harmonic content, pulsed amplitude, and smooth attack/release envelopes.

The goal is to avoid simply producing one extremely loud signal.

## 🔬 Signal Processing

### Phase Accumulation

Frequency sweeps update oscillator phase sample-by-sample:

```text
phase += 2π × frequency / sample_rate
```

This helps prevent unnecessary phase discontinuities during frequency changes.

### Smooth Envelopes

Attack and release envelopes are applied to avoid abrupt starts and stops.

### Pulsed Signals

Cleaning patterns use controlled pulse cycles rather than continuously playing the signal at the same level.

### Harmonic Control

Additional harmonics are mixed at lower amplitudes instead of generating multiple equally loud frequencies.

### Headroom

The generated signals use conservative amplitudes to reduce the possibility of digital clipping.

## 🖥️ Application Flow

```text
Open Application
      ↓
Select Device
      ↓
Select Cleaning Mode
      ↓
Review Cleaning Settings
      ↓
Start Cleaning
      ↓
Cleaning Session
      ↓
Audio Playing
      ↓
Timer + Progress + Frequency
      ↓
Stop / Complete
      ↓
Completion Screen
```

During an active cleaning session, configuration controls are locked so the user cannot accidentally change the device or cleaning mode while audio is playing.

## 🎧 Supported Devices

### Laptop Speakers
Designed for built-in laptop speakers.

### External Speakers
Can be used with speakers connected through:
- AUX
- USB
- Bluetooth

The application uses the current Windows audio output.

### AirPods / Earbuds

AirPods and other earbuds can be used as the selected output device.

**Important:** Remove earbuds from your ears before starting a cleaning sequence.

Cleaning tones are not intended to be played directly into the ears.

## 📁 Project Structure

```text
speaker-cleaner/
│
├── src/
│   └── React frontend
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   └── audio.rs
│   │
│   ├── icons/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
│
├── package.json
├── vite.config.*
└── README.md
```

## ⚙️ Requirements

To build the application from source:

- Windows
- Node.js
- Rust
- Cargo
- Tauri CLI

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/ANURODHOP/speaker-cleaner.git
```

Enter the project:

```bash
cd speaker-cleaner
```

Install frontend dependencies:

```bash
npm install
```

Check the Rust backend:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

## ▶️ Development

Run the application in development mode:

```bash
npm run tauri dev
```

Or:

```bash
npx tauri dev
```

## 🏗️ Build

Build the frontend:

```bash
npm run build
```

Build the production desktop application:

```bash
npm run tauri build
```

## 🧪 Testing

### Rust

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

### Frontend

```bash
npm run build
```

### Desktop Application

```bash
npx tauri dev
```

Manual checks should include:

- Application launches
- Frontend loads correctly
- Device selection works
- Cleaning mode selection works
- Quick cleaning works
- Balanced cleaning works
- Deep cleaning works
- Audio actually plays
- Timer updates
- Progress updates
- Frequency information updates correctly
- Stop button stops playback
- Controls unlock after stopping
- Natural completion works
- Completion screen appears
- AirPods/earbuds warning appears

## ⚠️ Safety

Speaker Cleaner is intended as a software experiment and audio utility.

Use moderate system volume.

Do not use cleaning tones while wearing earbuds or headphones.

If a device has significant water exposure, especially if water may have reached internal electronics, allow the device to dry appropriately and consider professional repair.

The application cannot guarantee removal of water, dust, or physical debris.

## 🔮 Future Improvements

Possible future improvements include:

- Better Windows output-device detection
- Device-specific audio profiles
- More specialized cleaning sequences
- Better frequency visualization
- More precise real-time frequency reporting
- More testing across different laptop speakers
- More testing across Bluetooth speakers
- Better AirPods / earbud channel handling
- Left/right channel controls
- Additional cleaning profiles
- Improved audio calibration
- More robust stop/restart handling
- Improved error reporting
- Installer and automatic updates
- Performance improvements
- More extensive automated testing

## 🎯 Project Goals

The main goals of this project are:

1. Learn desktop application development.
2. Learn how Tauri connects a web frontend with Rust.
3. Experiment with programmatic audio generation.
4. Understand real-time audio playback.
5. Build a practical application instead of a simple tutorial project.
6. Improve the application through real testing and iteration.

## 📌 Current Status

**Early working version**

The core desktop application and programmatic audio engine are implemented.

The project is still being improved, especially around:

- UI/UX
- Device handling
- Audio profiles
- Testing
- Frequency reporting
- Cross-device behavior

## 👨‍💻 Author

**Anurodh Prasai**

GitHub:  
https://github.com/ANURODHOP

## 📄 License

Add your preferred license here.

For example:

```text
MIT License
```

if you decide to release the project under MIT.
