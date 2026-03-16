import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const products = await prisma.products.findMany({
    where: { is_active: true },
    orderBy: { id: 'asc' },
    select: { code: true, name: true, price: true }
  })
  return { products }
})