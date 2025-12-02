// Enable console for debugging white screen issues
// Comment this out after fixing
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    println!("Starting Tauri application...");
    
    tauri::Builder::default()
        .setup(|app| {
            println!("Tauri setup complete");
            let window = app.get_webview_window("main").unwrap();
            
            // Always open devtools to debug white screen
            window.open_devtools();
            
            println!("Window created and devtools opened");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
