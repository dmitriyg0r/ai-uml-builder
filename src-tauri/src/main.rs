// Enable console for debugging white screen issues
// Comment this out after fixing
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    println!("Starting Tauri application...");
    
    tauri::Builder::default()
        .setup(|app| {
            println!("Tauri setup complete");
            
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                println!("DevTools opened");
            }
            
            println!("Window created");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
