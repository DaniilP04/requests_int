import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = Number(getQuery(event).id)

  await prisma.schools.delete({
    where: { id }
  })

  return { success: true }
})