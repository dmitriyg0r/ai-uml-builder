// Temporarily enable console for debugging
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    println!("Starting Tauri application...");
    
    tauri::Builder::default()
        .setup(|app| {
            println!("Tauri setup complete");
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
