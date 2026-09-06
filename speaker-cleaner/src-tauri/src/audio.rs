use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;
use std::f32::consts::PI;
use std::num::NonZeroU16;
use std::num::NonZeroU32;

use rodio::{Player, Source};
use rodio::stream::{DeviceSinkBuilder, MixerDeviceSink};

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CleaningMode {
    Quick,
    Balanced,
    Deep,
}

impl CleaningMode {
    pub fn patterns(&self) -> Vec<CleaningPattern> {
        match self {
            CleaningMode::Quick => vec![CleaningPattern::WaterEject],
            CleaningMode::Balanced => vec![CleaningPattern::WaterEject, CleaningPattern::DustSweep],
            CleaningMode::Deep => vec![CleaningPattern::WaterEject, CleaningPattern::DustSweep, CleaningPattern::FullSpectrum],
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CleaningPattern {
    WaterEject,
    DustSweep,
    FullSpectrum,
}

impl CleaningPattern {
    fn duration(&self) -> Duration {
        match self {
            CleaningPattern::WaterEject => Duration::from_secs(30),
            CleaningPattern::DustSweep => Duration::from_secs(20),
            CleaningPattern::FullSpectrum => Duration::from_secs(30),
        }
    }
    
    fn sample_rate(&self) -> u32 {
        44100
    }
}

#[derive(Clone, serde::Serialize)]
pub struct ProgressUpdate {
    pub progress: f32,
    pub current_pattern: String,
    pub pattern_progress: f32,
    pub remaining_secs: u64,
    pub current_frequency_hz: Option<f32>,
}

type ProgressCallback = Box<dyn Fn(ProgressUpdate) + Send + Sync>;
type CompleteCallback = Box<dyn Fn() + Send + Sync>;

pub struct AudioEngine {
    _sink: Option<MixerDeviceSink>,
    player: Option<Player>,
    mode: CleaningMode,
    is_playing: Arc<Mutex<bool>>,
    progress_callback: Option<ProgressCallback>,
    complete_callback: Option<CompleteCallback>,
    thread_handle: Option<thread::JoinHandle<()>>,
}

impl AudioEngine {
    pub fn new(mode: CleaningMode) -> Result<Self, String> {
        let sink = DeviceSinkBuilder::open_default_sink()
            .map_err(|e| format!("Failed to initialize audio: {}", e))?;
        
        let player = Player::connect_new(&sink.mixer());
        player.set_volume(0.85); // Make it loud for actual cleaning
        
        Ok(Self {
            _sink: Some(sink),
            player: Some(player),
            mode,
            is_playing: Arc::new(Mutex::new(false)),
            progress_callback: None,
            complete_callback: None,
            thread_handle: None,
        })
    }
    
    pub fn on_progress<F>(&mut self, callback: F)
    where
        F: Fn(ProgressUpdate) + Send + Sync + 'static,
    {
        self.progress_callback = Some(Box::new(callback));
    }
    
    pub fn on_complete<F>(&mut self, callback: F)
    where
        F: Fn() + Send + Sync + 'static,
    {
        self.complete_callback = Some(Box::new(callback));
    }
    
    pub fn start(&mut self) -> Result<(), String> {
        *self.is_playing.lock().unwrap() = true;
        
        let is_playing = self.is_playing.clone();
        let mode = self.mode;
        let player = self.player.take().unwrap();
        let progress_callback = self.progress_callback.take();
        let complete_callback = self.complete_callback.take();
        
        let handle = thread::spawn(move || {
            Self::play_sequence(mode, player, is_playing, progress_callback, complete_callback);
        });
        
        self.thread_handle = Some(handle);
        Ok(())
    }
    
    fn play_sequence(
        mode: CleaningMode,
        player: Player,
        is_playing: Arc<Mutex<bool>>,
        progress_callback: Option<ProgressCallback>,
        complete_callback: Option<CompleteCallback>,
    ) {
        let patterns = mode.patterns();
        let total_duration: u64 = patterns.iter().map(|p| p.duration().as_secs()).sum();
        let mut elapsed: u64 = 0;
        
        for pattern in patterns.iter() {
            if !*is_playing.lock().unwrap() {
                break;
            }
            
            let pattern_duration = pattern.duration();
            let pattern_secs = pattern_duration.as_secs_f32();
            let sample_rate = pattern.sample_rate();
            let total_samples = (pattern_secs * sample_rate as f32) as usize;
            
            let source: Box<dyn Source<Item = f32> + Send> = match pattern {
                CleaningPattern::WaterEject => Box::new(WaterEjectSource::new(sample_rate, total_samples)),
                CleaningPattern::DustSweep => Box::new(DustSweepSource::new(sample_rate, total_samples)),
                CleaningPattern::FullSpectrum => Box::new(FullSpectrumSource::new(sample_rate, total_samples)),
            };
            
            player.append(source);
            
            let pattern_name = format!("{:?}", pattern);
            let start_elapsed = elapsed;
            let start_time = Instant::now();
            
            // Rely on accurate wall-clock time rather than player queue length to ensure timer always ticks
            while start_time.elapsed().as_secs_f32() < pattern_secs {
                if !*is_playing.lock().unwrap() {
                    player.stop();
                    break;
                }
                
                thread::sleep(Duration::from_millis(50));
                
                // Track actual wall-clock time for accurate timer
                let actual_elapsed = start_time.elapsed().as_secs_f32();
                let pattern_elapsed = actual_elapsed.min(pattern_secs);
                elapsed = start_elapsed + pattern_elapsed as u64;
                let progress = elapsed as f32 / total_duration as f32;
                let pattern_progress = pattern_elapsed / pattern_secs;
                let remaining = total_duration.saturating_sub(elapsed);
                
                let current_frequency_hz = match pattern {
                    CleaningPattern::WaterEject => Some(165.0),
                    CleaningPattern::DustSweep => {
                        let start_freq = 100.0f32;
                        let end_freq = 8000.0f32;
                        Some(start_freq * (end_freq / start_freq).powf(pattern_progress))
                    },
                    CleaningPattern::FullSpectrum => {
                        let cycle = (pattern_progress * 5.0) % 1.0;
                        let sweep_t = if cycle < 0.5 { cycle * 2.0 } else { 2.0 - cycle * 2.0 };
                        let start_freq = 150.0f32;
                        let end_freq = 5000.0f32;
                        Some(start_freq * (end_freq / start_freq).powf(sweep_t))
                    }
                };
                
                if let Some(ref cb) = progress_callback {
                    cb(ProgressUpdate {
                        progress: progress.min(1.0),
                        current_pattern: pattern_name.clone(),
                        pattern_progress: pattern_progress.min(1.0).max(0.0),
                        remaining_secs: remaining,
                        current_frequency_hz,
                    });
                }
            }
            
            elapsed = start_elapsed + pattern_duration.as_secs();
        }
        
        *is_playing.lock().unwrap() = false;
        
        if let Some(cb) = complete_callback {
            cb();
        }
    }
    
    pub fn stop(&mut self) {
        *self.is_playing.lock().unwrap() = false;
        if let Some(player) = &self.player {
            player.stop();
        }
        if let Some(handle) = self.thread_handle.take() {
            let _ = handle.join();
        }
    }
}

// --- Helper functions for clean signal generation ---

fn smooth_step(x: f32) -> f32 {
    x * x * (3.0 - 2.0 * x)
}

fn adsr_envelope(progress: f32, attack: f32, release: f32) -> f32 {
    if progress < attack {
        smooth_step(progress / attack)
    } else if progress > 1.0 - release {
        smooth_step((1.0 - progress) / release)
    } else {
        1.0
    }
}

fn full_envelope(progress: f32, attack: f32, release: f32, sustain_mod: Option<(f32, f32)>) -> f32 {
    let base = adsr_envelope(progress, attack, release);
    if let Some((mod_freq, mod_depth)) = sustain_mod {
        let mod_signal = (1.0 - mod_depth) + mod_depth * (2.0 * PI * mod_freq * progress).sin();
        base * mod_signal
    } else {
        base
    }
}

// --- Audio source implementations ---

struct WaterEjectSource {
    sample_rate: u32,
    total_samples: usize,
    current_sample: usize,
    phase: f32,
}

impl WaterEjectSource {
    fn new(sample_rate: u32, total_samples: usize) -> Self {
        Self {
            sample_rate,
            total_samples,
            current_sample: 0,
            phase: 0.0,
        }
    }
}

impl Iterator for WaterEjectSource {
    type Item = f32;
    
    fn next(&mut self) -> Option<Self::Item> {
        if self.current_sample >= self.total_samples {
            return None;
        }
        
        let sr = self.sample_rate as f32;
        let t = self.current_sample as f32 / sr;
        
        const BASE_FREQ: f32 = 165.0;
        self.phase += 2.0 * PI * BASE_FREQ / sr;
        
        // Typical water eject pulse: strong tone pulsing on and off
        let pulse_cycle = t % 1.0;
        let pulse = if pulse_cycle < 0.8 { 1.0 } else { 0.0 };
        
        // Add a slight click/thump at the beginning of each pulse to jolt the speaker
        let thump = if pulse_cycle < 0.05 { 1.0 - (pulse_cycle / 0.05) } else { 0.0 };
        
        let mut sample = self.phase.sin() * pulse;
        sample += thump * 0.3 * (self.phase * 0.5).sin();
        
        // Overall envelope to prevent popping at start/end of the 30s period
        let envelope = full_envelope(self.current_sample as f32 / self.total_samples as f32, 0.01, 0.01, None);
        
        // Smooth the pulse edges to prevent high-frequency artifacts (clicking) during the pulses
        let pulse_envelope_smoothing = if pulse_cycle < 0.02 {
            smooth_step(pulse_cycle / 0.02)
        } else if pulse_cycle > 0.78 && pulse_cycle < 0.8 {
            smooth_step((0.8 - pulse_cycle) / 0.02)
        } else {
            1.0
        };

        self.current_sample += 1;
        Some(sample * envelope * pulse_envelope_smoothing * 0.95)
    }
}

impl Source for WaterEjectSource {
    fn current_span_len(&self) -> Option<usize> { Some(self.total_samples - self.current_sample) }
    fn channels(&self) -> NonZeroU16 { NonZeroU16::new(1).unwrap() }
    fn sample_rate(&self) -> NonZeroU32 { NonZeroU32::new(self.sample_rate).unwrap() }
    fn total_duration(&self) -> Option<Duration> { Some(Duration::from_secs_f32(self.total_samples as f32 / self.sample_rate as f32)) }
}

struct DustSweepSource {
    sample_rate: u32,
    total_samples: usize,
    current_sample: usize,
    sweep_phase: f32,
}

impl DustSweepSource {
    fn new(sample_rate: u32, total_samples: usize) -> Self {
        Self {
            sample_rate,
            total_samples,
            current_sample: 0,
            sweep_phase: 0.0,
        }
    }
}

impl Iterator for DustSweepSource {
    type Item = f32;
    
    fn next(&mut self) -> Option<Self::Item> {
        if self.current_sample >= self.total_samples {
            return None;
        }
        
        let progress = self.current_sample as f32 / self.total_samples as f32;
        let sr = self.sample_rate as f32;
        
        const START_FREQ: f32 = 100.0;
        const END_FREQ: f32 = 8000.0;
        let freq = START_FREQ * (END_FREQ / START_FREQ).powf(progress);
        
        self.sweep_phase += 2.0 * PI * freq / sr;
        let sample = self.sweep_phase.sin();
        
        let envelope = full_envelope(progress, 0.01, 0.01, None);
        
        self.current_sample += 1;
        Some(sample * envelope * 0.8)
    }
}

impl Source for DustSweepSource {
    fn current_span_len(&self) -> Option<usize> { Some(self.total_samples - self.current_sample) }
    fn channels(&self) -> NonZeroU16 { NonZeroU16::new(1).unwrap() }
    fn sample_rate(&self) -> NonZeroU32 { NonZeroU32::new(self.sample_rate).unwrap() }
    fn total_duration(&self) -> Option<Duration> { Some(Duration::from_secs_f32(self.total_samples as f32 / self.sample_rate as f32)) }
}

struct FullSpectrumSource {
    sample_rate: u32,
    total_samples: usize,
    current_sample: usize,
    phase: f32,
}

impl FullSpectrumSource {
    fn new(sample_rate: u32, total_samples: usize) -> Self {
        Self {
            sample_rate,
            total_samples,
            current_sample: 0,
            phase: 0.0,
        }
    }
}

impl Iterator for FullSpectrumSource {
    type Item = f32;
    
    fn next(&mut self) -> Option<Self::Item> {
        if self.current_sample >= self.total_samples {
            return None;
        }
        
        let progress = self.current_sample as f32 / self.total_samples as f32;
        let sr = self.sample_rate as f32;
        
        // 5 up-down cycles
        let cycle = (progress * 5.0) % 1.0;
        let sweep_t = if cycle < 0.5 { cycle * 2.0 } else { 2.0 - cycle * 2.0 };
        
        let start_freq = 150.0f32;
        let end_freq = 5000.0f32;
        let freq = start_freq * (end_freq / start_freq).powf(sweep_t);
        
        self.phase += 2.0 * PI * freq / sr;
        let sample = self.phase.sin();
        
        let envelope = full_envelope(progress, 0.01, 0.01, None);
        
        self.current_sample += 1;
        Some(sample * envelope * 0.8)
    }
}

impl Source for FullSpectrumSource {
    fn current_span_len(&self) -> Option<usize> { Some(self.total_samples - self.current_sample) }
    fn channels(&self) -> NonZeroU16 { NonZeroU16::new(1).unwrap() }
    fn sample_rate(&self) -> NonZeroU32 { NonZeroU32::new(self.sample_rate).unwrap() }
    fn total_duration(&self) -> Option<Duration> { Some(Duration::from_secs_f32(self.total_samples as f32 / self.sample_rate as f32)) }
}
