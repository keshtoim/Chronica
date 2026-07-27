use tauri::{command, Emitter, Window};

/// Запускает временный локальный HTTP-сервер (loopback) для приёма OAuth-редиректа от Google
/// в десктопном потоке авторизации. Возвращает порт, на котором сервер слушает; полученный
/// redirect URL приходит во фронтенд через событие "oauth-redirect".
#[command]
async fn start_oauth_server(window: Window) -> Result<u16, String> {
  tauri_plugin_oauth::start(move |url| {
    let _ = window.emit("oauth-redirect", url);
  })
  .map_err(|err| err.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_deep_link::init())
    .invoke_handler(tauri::generate_handler![start_oauth_server])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
