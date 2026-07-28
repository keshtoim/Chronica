import type { CharacterClassId } from '@/data/entities'

export interface CharacterStatWeights {
  str: number
  int: number
  con: number
  per: number
}

export interface CharacterClassDef {
  id: CharacterClassId
  name: string
  icon: string
  description: string
  /** Веса распределения очков характеристик, в сумме дают 1. */
  weights: CharacterStatWeights
}

/** 4 классических класса из Habitica + два своих (Хронист, Страж). */
export const CLASS_DEFS: Record<CharacterClassId, CharacterClassDef> = {
  warrior: {
    id: 'warrior',
    name: 'Воин',
    icon: '⚔️',
    description: 'Полагается на грубую силу и выносливость — берёт задачи в лоб.',
    weights: { str: 0.4, con: 0.35, per: 0.15, int: 0.1 },
  },
  mage: {
    id: 'mage',
    name: 'Маг',
    icon: '🔮',
    description: 'Интеллект и внимательность — просчитывает пути наименьшего сопротивления.',
    weights: { int: 0.45, per: 0.25, con: 0.15, str: 0.15 },
  },
  rogue: {
    id: 'rogue',
    name: 'Плут',
    icon: '🗡️',
    description: 'Ловкость и внимание к деталям — везде успевает первым.',
    weights: { per: 0.4, str: 0.3, int: 0.2, con: 0.1 },
  },
  healer: {
    id: 'healer',
    name: 'Целитель',
    icon: '✨',
    description: 'Выносливость и ум — заботится о балансе, а не о рывках.',
    weights: { con: 0.35, int: 0.35, per: 0.2, str: 0.1 },
  },
  chronicler: {
    id: 'chronicler',
    name: 'Хронист',
    icon: '📖',
    description:
      'Видит всю картину сразу — держит в голове календарь, задачи и привычки одновременно.',
    weights: { per: 0.35, int: 0.3, con: 0.2, str: 0.15 },
  },
  guardian: {
    id: 'guardian',
    name: 'Страж',
    icon: '🛡️',
    description: 'Несокрушимая выносливость — ничто не выбивает из колеи и не срывает привычки.',
    weights: { con: 0.45, str: 0.3, per: 0.15, int: 0.1 },
  },
}

export const CLASS_LIST = Object.values(CLASS_DEFS)

export interface CharacterStats {
  str: number
  int: number
  con: number
  per: number
}

/**
 * Чисто косметический показатель прогресса: пул очков растёт с уровнем и распределяется
 * по весам класса. Не влияет на игровую механику (её пока нет) — задел для будущего развития.
 */
export function computeCharacterStats(level: number, classId: CharacterClassId): CharacterStats {
  const pool = level * 3
  const weights = CLASS_DEFS[classId].weights
  return {
    str: 1 + Math.round(pool * weights.str),
    int: 1 + Math.round(pool * weights.int),
    con: 1 + Math.round(pool * weights.con),
    per: 1 + Math.round(pool * weights.per),
  }
}
