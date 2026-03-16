import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const products = await prisma.products.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, code: true, name: true, price: true, is_active: true, updated_at: true }
  })
  return { products }
})