import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)
  const me = (event as any).context.user as { id: number; is_super: boolean } | undefined

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })
  const targetId = Number(id)

  if (me && me.id === targetId) {
    throw createError({ statusCode: 400, statusMessage: 'Нельзя удалить самого себя' })
  }

  const target = await prisma.admin.findUnique({
    where: { id: targetId },
    select: { id: true, is_super: true }
  })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })

  if (target.is_super) {
    const superCount = await prisma.admin.count({ where: { is_super: true } })
    if (superCount <= 1) {
      throw createError({ statusCode: 400, statusMessage: 'Нельзя удалить единственного супер-админа' })
    }
  }

  await prisma.admin.delete({ where: { id: targetId } })
  return { ok: true }
})
