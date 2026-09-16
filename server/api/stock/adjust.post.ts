import { createError, readBody } from 'h3'
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = (event as any).context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (!user.is_super) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: super admin only' })
  }

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const quantity = Number(body?.quantity)
  const note = typeof body?.note === 'string' ? body.note.trim() : ''

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'productId is required' })
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw createError({ statusCode: 400, statusMessage: 'quantity must be a non-negative integer' })
  }

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.products.findUnique({
      where: { id: productId },
      select: { id: true, quantity: true, isAvailable: true }
    })

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    const delta = quantity - product.quantity

    const updated = await tx.products.update({
      where: { id: productId },
      data: {
        quantity,
        isAvailable: quantity > 0 ? undefined : false,
        updated_at: new Date()
      },
      select: {
        id: true,
        quantity: true
      }
    })

    if (delta !== 0) {
      await tx.stock_movements.create({
        data: {
          product_id: productId,
          quantity: delta,
          type: 'adjustment',
          note: note || null,
          created_by: user.username || null
        }
      })
    }

    return updated
  })

  return { ok: true, product: result }
})
