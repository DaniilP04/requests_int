import { prisma } from '~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const { username, password, is_super = false } = await readBody(event)
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'username and password are required' })
  }
  const hashed = await bcrypt.hash(password, 10)
  const { id } = await prisma.admin.create({
    data: { username, hashed_password: hashed, is_super },
    select: { id: true }
  })
  return { id }
})
