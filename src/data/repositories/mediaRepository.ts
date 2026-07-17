import { v4 as uuidv4 } from 'uuid'
import { db } from '@/data/db'

/** Хранилище blob'ов изображений (фото задач/событий, фон приложения) — на них ссылаются MediaRef.blobKey. */
export const mediaRepository = {
  async store(blob: Blob): Promise<string> {
    const blobKey = uuidv4()
    await db.media.add({ blobKey, blob })
    return blobKey
  },

  async get(blobKey: string): Promise<Blob | undefined> {
    const record = await db.media.get(blobKey)
    return record?.blob
  },

  async remove(blobKey: string): Promise<void> {
    await db.media.delete(blobKey)
  },
}
