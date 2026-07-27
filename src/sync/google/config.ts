/**
 * OAuth Client ID не являются секретом (в отличие от Client Secret) — их безопасно хранить
 * в коде репозитория. Приватные ключи (например, keystore для подписи Android) в код не идут,
 * см. .gitignore (secrets-local/, *.keystore).
 */
export const GOOGLE_OAUTH_CLIENT_IDS = {
  web: '505538302063-552o08gh1chni9s0gciqe5c9a1f5m50m.apps.googleusercontent.com',
  desktop: '505538302063-70neustmgkr73eir5h5lve8pommmi7ps.apps.googleusercontent.com',
  android: '505538302063-o1822h41e6as8o4sinf53c7hhp6bcaqc.apps.googleusercontent.com',
} as const

/** Узкий scope — доступ только к скрытой appDataFolder приложения, не ко всему Google Диску. */
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'

/** Имя файла резервной копии внутри appDataFolder. */
export const SYNC_FILE_NAME = 'sync_data.json'
