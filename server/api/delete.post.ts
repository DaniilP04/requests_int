import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Сериализация телеграм айдишника так как он бигинт и просто так не может
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const { track_id } = body

    if (!track_id) {
      throw createError({ statusCode: 400, statusMessage: 'track_id не передан' })
    }

    const updated = await prisma.requests.update({
      where: { track_id },
      data: { deleted: true},
    })

    return {
      success: true,
      message: 'Запись успешно удалена (помечена как удалённая)',
      request: serializeBigInt(updated)
    }

  } catch (error) {
    console.error('Ошибка при удалении:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении заявки',
    })
  }
})