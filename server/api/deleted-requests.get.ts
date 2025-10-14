import { prisma } from '~/server/utils/db'


export default defineEventHandler(async () => {
  const requests = await prisma.requests.findMany({
    where: { deleted: true }, 
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