import { prisma } from '~/server/utils/db'
import { getQuery, createError } from 'h3'

function normalizeProduct(deviceType: string): 'Карта' | 'Браслет' | 'Брелок' | 'Другое' {
  const s = (deviceType || '').trim()
  if (s.startsWith('Браслет')) return 'Браслет'
  if (s.startsWith('Карта')) return 'Карта'
  if (s.startsWith('Брелок')) return 'Брелок'
  return 'Другое'
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const from = String(q.from || '')
  const to = String(q.to || '')

  if (!from || !to) {
    throw createError({ statusCode: 400, statusMessage: 'from and to are required (YYYY-MM-DD)' })
  }

  const dateFrom = new Date(`${from}T00:00:00.000Z`)
  const dateTo = new Date(`${to}T23:59:59.999Z`)
  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }

  // 1) Берём цены из БД (products)
  const products = await prisma.products.findMany({
    where: { is_active: true },
    select: { name: true, price: true }
  })
  const priceMap = new Map(products.map(p => [p.name, p.price]))

  // 2) Берём выданные заявки за период
  const rows = await prisma.requests.findMany({
    where: {
      status: 'Выдан',
      deleted: false,
      status_modified_at: { gte: dateFrom, lte: dateTo }
    },
    select: { device_type: true }
  })

  const result: Record<string, { product: string; price: number; count: number; sum: number }> = {}

  for (const r of rows) {
    const product = normalizeProduct(r.device_type || '')
    const price = priceMap.get(product) ?? 0
    if (!result[product]) result[product] = { product, price, count: 0, sum: 0 }
    result[product].count += 1
    result[product].sum += price
  }

  const items = Object.values(result).filter(i => i.count > 0)
  const total = items.reduce((acc, i) => acc + i.sum, 0)

  return { from, to, items, total }
})