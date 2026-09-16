import { prisma } from '~/server/utils/db'
import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const code = String(body.code || '').trim()
  const name = String(body.name || '').trim()
  const color = body.color ? String(body.color).trim() : null
  const price = Number(body.price)
  const quantity = body.quantity === undefined ? 0 : Number(body.quantity)
  const isAvailable = body.isAvailable === undefined ? true : Boolean(body.isAvailable)

  if (!code || !name) {
    throw createError({ statusCode: 400, statusMessage: 'code and name are required' })
  }
  if (!Number.isFinite(price) || price < 0 || price > 1000000) {
    throw createError({ statusCode: 400, statusMessage: 'invalid price' })
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw createError({ statusCode: 400, statusMessage: 'invalid quantity' })
  }

  const existing = await prisma.products.findUnique({ where: { code } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'product with this code already exists' })
  }

  const product = await prisma.products.create({
    data: {
      code,
      name,
      color,
      price,
      quantity,
      isAvailable
    }
  })

  return { ok: true, product }
})
