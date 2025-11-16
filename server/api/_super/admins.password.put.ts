import { prisma } from '~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const { id, newPassword } = await readBody(event)
  if (!id || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'id and newPassword are required' })
  }
  const hashed = await bcrypt.hash(String(newPassword), 10)
  await prisma.admin.update({
    where: { id: Number(id) },
    data: { hashed_password: hashed }
  })
  return { ok: true }
})
