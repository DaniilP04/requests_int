import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { code, price, isAvailable } = await readBody(event)

  if (!code || price === undefined || typeof isAvailable !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'code, price and isAvailable are required' })
  }

  const p = Number(price)
  if (!Number.isFinite(p) || p < 0 || p > 1000000) {
    throw createError({ statusCode: 400, statusMessage: 'invalid price' })
  }

  const existing = await prisma.products.findUnique({
    where: { code: String(code) },
    select: { name: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'product not found' })
  }

  await prisma.products.updateMany({
    where: { name: existing.name },
    data: {
      price: p,
      isAvailable: Boolean(isAvailable),
      updated_at: new Date()
    }
  })

  return { ok: true }
})
