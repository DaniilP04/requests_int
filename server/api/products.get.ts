import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const products = await prisma.products.findMany({
    where: { isAvailable: true },
    orderBy: { id: 'asc' },
    select: { code: true, name: true, color: true, price: true, quantity: true }
  })
  const groupedProducts = new Map<string, { code: string; name: string; price: number; colors: string[] }>()

  for (const product of products) {
    if (product.name === 'Браслет' && !product.color) {
      continue
    }

    if (product.name === 'Браслет' && product.color && product.quantity <= 0) {
      continue
    }

    const existing = groupedProducts.get(product.name)
    if (!existing) {
      groupedProducts.set(product.name, {
        code: product.code,
        name: product.name,
        price: product.price,
        colors: product.color ? [product.color] : []
      })
      continue
    }

    if (product.color && !existing.colors.includes(product.color)) {
      existing.colors.push(product.color)
    }
  }

  return {
    products: Array.from(groupedProducts.values()).map((product) => ({
      ...product,
      colors: product.colors.sort((a, b) => a.localeCompare(b, 'ru'))
    }))
  }
})
