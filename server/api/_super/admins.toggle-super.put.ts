import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const row = await prisma.admin.findUnique({
    where: { id: Number(id) },
    select: { is_super: true }
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const updated = await prisma.admin.update({
    where: { id: Number(id) },
    data: { is_super: !row.is_super },
    select: { id: true, is_super: true }
  })
  return { updated }
})
