import { createError, readBody } from 'h3'
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = (event as any).context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const quantity = Number(body?.quantity)
  const note = typeof body?.note === 'string' ? body.note.trim() : ''

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'productId is required' })
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'quantity must be a positive integer' })
  }

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.products.findUnique({
      where: { id: productId },
      select: { id: true, quantity: true, isAvailable: true }
    })

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    const updated = await tx.products.update({
      where: { id: productId },
      data: {
        quantity: product.quantity + quantity,
        isAvailable: product.quantity + quantity > 0 ? true : product.isAvailable,
        updated_at: new Date()
      },
      select: {
        id: true,
        quantity: true
      }
    })

    await tx.stock_movements.create({
      data: {
        product_id: productId,
        quantity,
        type: 'receipt',
        note: note || null,
        created_by: user.username || null
      }
    })

    return updated
  })

  return { ok: true, product: result }
})
