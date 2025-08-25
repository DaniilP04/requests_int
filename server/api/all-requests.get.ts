import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  const requests = await prisma.requests.findMany({
    where: { deleted: false }, 
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      full_name: true,
      school: true,
      class: true,
      device_type: true,
      track_id: true,
      status: true,
      created_at: true,
      source: true,
      status_modified_at: true,
      phone: true
    }
  })

  return {
    requests
  }
})