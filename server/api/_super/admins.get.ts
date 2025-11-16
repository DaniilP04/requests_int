import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, is_super: true, createdAt: true }
  })
  return { admins }
})
