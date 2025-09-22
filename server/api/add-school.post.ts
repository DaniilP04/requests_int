import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const newSchool = await prisma.schools.create({
    data: {
      name: body.name,
      type: body.type
    }
  })

  return {
    success: true,
    school: newSchool
  }
})