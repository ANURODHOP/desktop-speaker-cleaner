# Speaker Cleaner

## 1. Product Overview

**Speaker Cleaner** is a lightweight desktop application built with **Tauri + Rust** that plays carefully designed audio patterns intended to help clear moisture and debris from speaker openings.

The application should feel like a small, polished hardware utility rather than an AI application or a generic dashboard.

The goal is:

> **Simple to use, beautiful to look at, lightweight, reliable, and completely self-contained.**

The user should be able to open the application, choose a cleaning mode, press one button, and let the cleaning sequence run.

---

# 2. Core Principles

The project should follow these principles throughout development:

### Simple

Do not turn a small speaker-cleaning utility into a complicated application.

Every feature should justify its existence.

### Beautiful

The UI should feel professionally designed and polished.

It should have good typography, spacing, hierarchy, animation, and interaction states.

### Lightweight

Keep the application small and efficient.

Avoid unnecessary dependencies, services, frameworks, and abstractions.

### Self-contained

The finished application should not require:

* Internet
* API keys
* Cloud services
* AI services
* Accounts
* External servers
* External audio software
* FFmpeg
* VLC
* Python
* Any separate runtime dependency

The application should work locally.

### Reliable

A simple application that works consistently is more valuable than a feature-heavy application with fragile behavior.

---

# 3. Technology

Primary architecture:

```text
Frontend
   ↓
Tauri
   ↓
Rust
   ↓
System Audio
```

Use Tauri with a Rust backend.

The frontend may use the existing project frontend framework if one already exists.

Rust should handle the audio functionality.

The frontend should handle presentation and user interaction.

Keep frontend ↔ Rust communication straightforward.

---

# 4. Audio System

The application should not depend on a collection of external MP3/WAV files if the audio can reasonably be generated programmatically.

Prefer generating tones and sweeps inside the Rust audio layer.

The application should have several cleaning patterns rather than relying on a single sound.

Possible patterns:

### Gentle

A softer sequence intended for users who want a less aggressive cleaning cycle.

### Balanced

The default recommended pattern.

Uses a mixture of frequencies, pulses, sweeps, and pauses.

### Full Sweep

Uses broader frequency sweeps.

### Low Pulse

Uses controlled lower-frequency pulses.

### Broad Sweep

Moves through a broad range of frequencies.

### Alternating Sweep

Alternates between lower and higher frequency ranges.

These names are user-facing concepts.

Users should not need to understand audio engineering to use the application.

---

# 5. Cleaning Modes

The initial application should provide three primary modes.

## Quick Clean

Approximately 30 seconds.

For users who want a short cleaning cycle.

## Balanced

Approximately 60 seconds.

The default and recommended option.

Designed as the general-purpose cleaning sequence.

## Deep Clean

Approximately 90 seconds.

A longer sequence using multiple patterns.

The exact durations and sequences may be adjusted during implementation if necessary for technical or audio-quality reasons.

---

# 6. Audio Safety

The application should use conservative audio levels.

Do not intentionally create extremely loud or unpleasant sounds.

The application should not claim that the cleaning process is guaranteed to remove water or debris.

Preferred wording:

> "Plays a carefully designed sound sequence to help clear moisture and debris from speaker openings."

Avoid claims such as:

> "Guaranteed to remove water."

The application should make it clear that it is an assistive cleaning utility and cannot guarantee physical removal of liquid or debris.

---

# 7. Output Device

The application should use the system's default audio output.

If reliable output-device enumeration is practical using the chosen Rust audio implementation, allow the user to select an output device.

If device selection introduces significant complexity or reliability problems, prefer the system default device.

Do not build a complicated audio-routing system.

If an output device becomes unavailable, the application should fail gracefully rather than crash.

---

# 8. Main User Experience

The application should primarily consist of one focused screen.

Conceptually:

```text
┌──────────────────────────────────────────────┐
│                                              │
│  Speaker Cleaner                   ● Ready   │
│                                              │
│                                              │
│                  ◉                           │
│                                              │
│                  00:30                       │
│                                              │
│        Speaker cleaning                     │
│                                              │
│  Plays a carefully designed sound sequence  │
│  to help clear moisture and debris.         │
│                                              │
│             ┌────────────────┐               │
│             │ Start Cleaning │               │
│             └────────────────┘               │
│                                              │
│       Quick       Balanced       Deep        │
│                                              │
│  Output: Default Speaker                    │
│                                              │
└──────────────────────────────────────────────┘
```

This is only a conceptual layout.

The final UI should be designed properly rather than copied literally.

---

# 9. Application States

The application should have clear states.

## Ready

Display:

* Selected mode
* Start button
* Output device
* Application status

## Cleaning

Display:

* Remaining time
* Current cleaning phase
* Subtle audio/waveform animation
* Stop button

The user must be able to stop playback at any time.

## Completed

Display:

> Cleaning complete

Provide:

> Run Again

The application should return to a clean usable state.

## Error

If audio cannot start:

> Unable to start audio playback. Please check that a speaker is connected.

Errors should be understandable to normal users.

Technical details can remain in developer logs.

---

# 10. Visual Design

The visual direction is extremely important.

The application should be:

**Modern + Professional + Minimal + Premium**

It should NOT look like a stereotypical AI application.

Avoid:

* Purple/blue gradient backgrounds
* Excessive glowing effects
* Neon colors
* AI sparkles
* Excessive glassmorphism
* Giant dashboard layouts
* Dozens of cards
* Fake analytics
* "AI Powered" labels
* Futuristic sci-fi styling

However, "not an AI UI" does NOT mean the interface should be boring, outdated, or ugly.

The application should still feel modern.

Think more like:

**premium hardware software / professional audio utility / polished native desktop application**

---

# 11. Visual Language

Recommended characteristics:

* Dark charcoal or near-black base
* Off-white primary text
* Restrained accent color
* Subtle borders
* Soft shadows
* Moderate corner radius
* Excellent spacing
* Strong typography hierarchy
* Minimal icons
* Subtle animations
* Clear hover states
* Clear pressed states
* Clear disabled states

Avoid visual clutter.

Use empty space intentionally.

The primary action should always be obvious.

---

# 12. Animation

Animation should communicate state rather than exist for decoration.

During cleaning, the central visual can show:

* Subtle waveform movement
* Speaker vibration representation
* Progress ring
* Frequency movement

Animation should be:

* Smooth
* Subtle
* Professional
* Low CPU usage

Do not use excessive particle effects, glowing waves, or distracting visualizers.

---

# 13. Settings

The first version should keep settings minimal.

Potential settings:

* Output device
* Cleaning mode
* Duration if appropriate
* Intensity if appropriate

Do not expose complicated audio-engineering controls in the main interface.

Technical controls such as exact frequency values should only be exposed if there is a strong reason to do so.

---

# 14. Error Handling

The application must never crash because:

* An audio device is missing
* An audio device changes
* Playback fails
* A Tauri command fails
* Invalid input is received
* The user presses Stop at an unexpected moment
* The user starts cleaning again
* A cleaning sequence completes

Frontend and Rust errors should be handled explicitly.

The UI should recover to a usable state whenever possible.

---

# 15. Architecture Philosophy

Prefer simple code.

The application does not need:

* A backend server
* REST APIs
* WebSockets
* Database
* Authentication
* Cloud storage
* User accounts
* AI
* Analytics
* Telemetry
* Complex state-management systems

The simplest architecture that reliably solves the problem is preferred.

---

# 16. Dependency Philosophy

Before adding a dependency, determine whether the feature can be implemented with the existing stack or native functionality.

Dependencies should be added only when they provide meaningful functionality that would otherwise be difficult or unreliable to implement.

Avoid dependency bloat.

The final application should remain self-contained.

---

# 17. Future Possibilities

These are NOT requirements for the initial version.

Potential future features:

* More cleaning patterns
* Custom duration
* Custom intensity
* Better output-device selection
* System tray support
* Keyboard shortcut
* Remember last selected mode
* More sophisticated audio sequences
* Speaker/output testing
* Optional advanced audio information

Do not implement these simply because they appear in this list.

The first version should remain small.

---

# 18. Non-Goals

Speaker Cleaner is NOT intended to become:

* An audio editor
* A music player
* An equalizer
* An audio recording application
* An AI audio analyzer
* A professional audio workstation
* A system-wide audio enhancer
* A hardware diagnostic suite

It is a focused utility.

---

# 19. Product Personality

The application should feel:

* Calm
* Trustworthy
* Precise
* Simple
* Professional
* Lightweight
* Useful

It should not feel:

* Flashy
* Gimmicky
* Over-engineered
* AI-generated
* Corporate
* Cluttered

The application should give the impression that a careful engineer designed a small tool specifically to solve one problem well.

---

# 20. Definition of Done

The first version is successful when a user can:

1. Launch the application.
2. Understand what it does immediately.
3. Select a cleaning mode.
4. Start a cleaning cycle.
5. Hear the intended audio sequence.
6. See clear progress.
7. Stop the cycle at any point.
8. Allow the cycle to finish.
9. Run it again.
10. Understand errors if audio cannot be played.

The application should build successfully, launch successfully, and operate without unhandled runtime errors.

Most importantly:

> **Do not optimize for the amount of code written. Optimize for a small application that actually works.**
