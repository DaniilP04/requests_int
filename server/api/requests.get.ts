import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const trackId = getQuery(event).track_id as string

  if (!trackId) {
    throw createError({ statusCode: 400, statusMessage: 'Track ID is required' })
  }

  const request = await prisma.requests.findUnique({
    where: { track_id: trackId }
  })

  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }

  return {
    status: request.status,
    full_name: request.full_name,
    school: request.school,
    class: request.class,
    device_type: request.device_type,
    created_at: request.created_at
  }
})
