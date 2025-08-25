// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 10)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      hashed_password: hashed,
    },
  })

  console.log('Admin user seeded.')
}

main().finally(() => prisma.$disconnect())
