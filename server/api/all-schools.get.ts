import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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