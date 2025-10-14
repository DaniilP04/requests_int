import { prisma } from '~/server/utils/db'


export default defineEventHandler(async () => {
  const schools = await prisma.schools.findMany({
    select: {
        id: true,
        name: true,
        type: true
    }
  })

  return {
    schools
  }
})