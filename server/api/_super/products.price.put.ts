import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { code, price } = await readBody(event)

  if (!code || price === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'code and price are required' })
  }

  const p = Number(price)
  if (!Number.isFinite(p) || p < 0 || p > 1000000) {
    throw createError({ statusCode: 400, statusMessage: 'invalid price' })
  }

  await prisma.products.update({
    where: { code: String(code) },
    data: { price: p, updated_at: new Date() }
  })

  return { ok: true }
})