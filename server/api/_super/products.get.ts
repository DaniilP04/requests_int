import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const products = await prisma.products.findMany({
    orderBy: { id: 'asc' },
    select: {
      code: true,
      name: true,
      price: true,
      isAvailable: true,
      updated_at: true
    }
  })

  const grouped = new Map<string, {
    code: string
    name: string
    price: number
    isAvailable: boolean
    updated_at: Date
  }>()

  for (const product of products) {
    const existing = grouped.get(product.name)
    if (!existing) {
      grouped.set(product.name, {
        code: product.code,
        name: product.name,
        price: product.price,
        isAvailable: product.isAvailable,
        updated_at: product.updated_at
      })
      continue
    }

    if (!existing.isAvailable && product.isAvailable) {
      existing.isAvailable = true
    }

    if (product.updated_at > existing.updated_at) {
      existing.updated_at = product.updated_at
    }
  }

  return {
    products: Array.from(grouped.values())
  }
})
