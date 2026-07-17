import type { EntityTable } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import type { BaseEntity } from '@/data/entities'
import { nowIso } from '@/data/db'

/**
 * Общий CRUD-враппер над Dexie-таблицей для сущностей с BaseEntity.
 * remove() — это soft delete (tombstone), нужен для last-write-wins слияния при синхронизации.
 */
export function createRepository<T extends BaseEntity>(table: EntityTable<T, 'id'>) {
  return {
    async list(): Promise<T[]> {
      const all = await table.toArray()
      return all.filter((item) => !item.deleted)
    },

    async get(id: string): Promise<T | undefined> {
      // Dexie не может вывести IDType<T, 'id'> из обобщённого T — id заведомо string (BaseEntity.id).
      const item = await (table.get as (id: string) => Promise<T | undefined>)(id)
      return item && !item.deleted ? item : undefined
    },

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Promise<T> {
      const timestamp = nowIso()
      const entity = {
        ...data,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
      } as unknown as T
      await table.add(entity)
      return entity
    },

    async update(id: string, changes: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
      const update = table.update as (id: string, changes: Partial<T>) => Promise<number>
      await update(id, { ...changes, updatedAt: nowIso() } as Partial<T>)
    },

    async remove(id: string): Promise<void> {
      const update = table.update as (id: string, changes: Partial<T>) => Promise<number>
      await update(id, { deleted: true, updatedAt: nowIso() } as Partial<T>)
    },

    /** Полное удаление записи — использовать только для очистки старых tombstone'ов. */
    async hardRemove(id: string): Promise<void> {
      await (table.delete as (id: string) => Promise<void>)(id)
    },
  }
}
