import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const botToken = process.env.TELEGRAM_BOT_TOKEN

// Сериализация телеграм айдишника так как он бигинт и просто так не может
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in .env')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { track_id, status } = body

  if (!track_id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'track_id and status are required' })
  }

  const updated = await prisma.requests.update({
    where: { track_id },
    data: { status }
  })

  const chatId = updated.telegram_id?.toString()
  if (!chatId) {
    return { success: true, updated }
  }

  const deviceType = updated.device_type || 'неизвестно'

  let messageText
  if (status.toLowerCase() === 'выполнен') {
    messageText = `Статус заявки с трек-номером ${track_id} обновлён на "${status}".\nУстройство: ${deviceType}. \nЗабрать с 9:00 до 20:00 по адресу: адрес]`
  } else {
    messageText = `Статус заявки с трек-номером ${track_id} обновлён на "${status}".\nУстройство: ${deviceType}`
  }

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: messageText
    })
  } catch (error) {
    console.error('Ошибка отправки уведомления в Telegram:', error)
  }

  return { success: true, updated: serializeBigInt(updated) }
})
