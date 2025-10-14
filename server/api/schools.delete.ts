import { prisma } from '~/server/utils/db'


export default defineEventHandler(async (event) => {
  const id = Number(getQuery(event).id)

  await prisma.schools.delete({
    where: { id }
  })

  return { success: true }
})