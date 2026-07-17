import { db } from '@/data/db'
import { createRepository } from '@/data/repositories/createRepository'

export const habitsRepository = createRepository(db.habits)
