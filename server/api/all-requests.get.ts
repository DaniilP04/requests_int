import { prisma } from '~/server/utils/db'
import jwt from 'jsonwebtoken'
import { getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // Простейшая серверная защита эндпоинта
  const cfg = useRuntimeConfig()
  const secret = cfg.JWT_SECRET as string
  const token = getCookie(event, 'auth')
  try {
    if (!secret || !token) throw new Error('no token')
    jwt.verify(token, secret)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const requests = await prisma.requests.findMany({
    where: { deleted: false },
    orderBy: { created_at: 'desc' },
    select: {
      id: true, full_name: true, school: true, class: true,
      device_type: true, track_id: true, status: true, created_at: true,
      source: true, status_modified_at: true, phone: true
    }
  })
  return { requests }
})
