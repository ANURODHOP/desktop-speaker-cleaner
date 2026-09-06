#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use tauri::{Emitter, Manager, State};

mod audio;
use audio::{CleaningMode, AudioEngine};

struct AppState {
    audio_engine: Mutex<Option<AudioEngine>>,
    is_playing: Mutex<bool>,
    current_mode: Mutex<CleaningMode>,
}

#[tauri::command]
fn start_cleaning(state: State<AppState>, window: tauri::Window) -> Result<(), String> {
    let mut is_playing = state.is_playing.lock().unwrap();
    if *is_playing {
        return Err("Already playing".into());
    }

    let mode = *state.current_mode.lock().unwrap();
    
    let mut engine_lock = state.audio_engine.lock().unwrap();
    let mut engine = AudioEngine::new(mode).map_err(|e| e.to_string())?;
    
    let window_clone = window.clone();
    engine.on_progress(move |progress| {
        let _ = window_clone.emit("cleaning-progress", progress);
    });
    
    let window_clone = window.clone();
    engine.on_complete(move || {
        let _ = window_clone.emit("cleaning-complete", ());
    });
    
    engine.start().map_err(|e| e.to_string())?;
    *engine_lock = Some(engine);
    *is_playing = true;
    
    Ok(())
}

#[tauri::command]
fn stop_cleaning(state: State<AppState>) -> Result<(), String> {
    let mut is_playing = state.is_playing.lock().unwrap();
    if !*is_playing {
        return Ok(());
    }
    
    let mut engine_lock = state.audio_engine.lock().unwrap();
    if let Some(mut engine) = engine_lock.take() {
        engine.stop();
    }
    *is_playing = false;
    
    Ok(())
}

#[tauri::command]
fn set_mode(state: State<AppState>, mode: CleaningMode) -> Result<(), String> {
    let is_playing = state.is_playing.lock().unwrap();
    if *is_playing {
        return Err("Cannot change mode while playing".into());
    }
    
    *state.current_mode.lock().unwrap() = mode;
    Ok(())
}

#[tauri::command]
fn get_mode(state: State<AppState>) -> Result<CleaningMode, String> {
    Ok(*state.current_mode.lock().unwrap())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            
            #[cfg(debug_assertions)]
            window.open_devtools();
            
            window.show().unwrap();
            Ok(())
        })
        .manage(AppState {
            audio_engine: Mutex::new(None),
            is_playing: Mutex::new(false),
            current_mode: Mutex::new(CleaningMode::Balanced),
        })
        .invoke_handler(tauri::generate_handler![
            start_cleaning,
            stop_cleaning,
            set_mode,
            get_mode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}