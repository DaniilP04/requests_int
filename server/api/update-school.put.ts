import { prisma } from '~/server/utils/db'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const updatedSchool = await prisma.schools.update({
    where: { id: body.id },
    data: {
      name: body.name,
      type: body.type
    }
  })

  return { success: true, school: updatedSchool }
})