// server/api/restore.ts
import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { track_id } = body

  if (!track_id) {
    return { error: 'track_id обязателен' }
  }

  try {
    const updated = await prisma.requests.updateMany({
      where: {
        track_id,
        deleted: true,
      },
      data: {
        deleted: false,
      },
    })

    if (updated.count === 0) {
      return { message: 'Запись не найдена или уже восстановлена' }
    }

    return { success: true, restored: updated.count }
  } catch (error) {
    console.error('Ошибка восстановления:', error)
    return { error: 'Ошибка при восстановлении записи' }
  }
})
