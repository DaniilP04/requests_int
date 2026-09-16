import { prisma } from '~/server/utils/db'
import { createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const code = String(getQuery(event).code || '').trim()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'code is required' })
  }

  const existing = await prisma.products.findUnique({
    where: { code },
    select: { name: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'product not found' })
  }

  // Одна строка в таблице цен представляет все цветовые варианты устройства
  // (см. группировку по name в products.get.ts / products.price.put.ts) —
  // поэтому удаление тоже затрагивает все варианты с этим названием.
  const { count } = await prisma.products.deleteMany({
    where: { name: existing.name }
  })

  return { ok: true, deletedCount: count }
})
