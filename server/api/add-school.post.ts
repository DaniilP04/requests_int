import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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