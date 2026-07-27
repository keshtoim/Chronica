import { SYNC_FILE_NAME } from '@/sync/google/config'

const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const MULTIPART_BOUNDARY = 'chronica-sync-boundary'

async function authorizedFetch(token: string, url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Google Drive API ${response.status}: ${body || response.statusText}`)
  }
  return response
}

async function findSyncFileId(token: string): Promise<string | null> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${SYNC_FILE_NAME}' and trashed = false`,
    fields: 'files(id)',
  })
  const response = await authorizedFetch(token, `${API_BASE}/files?${params.toString()}`)
  const data = (await response.json()) as { files: { id: string }[] }
  return data.files[0]?.id ?? null
}

/** Возвращает содержимое файла резервной копии из appDataFolder или null, если его ещё нет. */
export async function downloadSyncFile(token: string): Promise<string | null> {
  const fileId = await findSyncFileId(token)
  if (!fileId) return null
  const response = await authorizedFetch(token, `${API_BASE}/files/${fileId}?alt=media`)
  return response.text()
}

/** Создаёт или обновляет файл резервной копии в appDataFolder. */
export async function uploadSyncFile(token: string, content: string): Promise<void> {
  const fileId = await findSyncFileId(token)
  const metadata = fileId ? {} : { name: SYNC_FILE_NAME, parents: ['appDataFolder'] }

  const body =
    `--${MULTIPART_BOUNDARY}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${MULTIPART_BOUNDARY}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${content}\r\n` +
    `--${MULTIPART_BOUNDARY}--`

  const url = fileId
    ? `${UPLOAD_BASE}/files/${fileId}?uploadType=multipart`
    : `${UPLOAD_BASE}/files?uploadType=multipart`

  await authorizedFetch(token, url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${MULTIPART_BOUNDARY}` },
    body,
  })
}
