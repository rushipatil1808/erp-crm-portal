const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123', 10);

  const users = [
    { email: 'admin@erp.com', name: 'System Admin', role: 'ADMIN' },
    { email: 'sales@erp.com', name: 'Sales Staff', role: 'SALES' },
    { email: 'warehouse@erp.com', name: 'Warehouse Manager', role: 'WAREHOUSE' },
    { email: 'accounts@erp.com', name: 'Accounts Executive', role: 'ACCOUNTS' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, password: hash, name: u.name, role: u.role },
    });
    console.log('Seeded:', u.email);
  }
  console.log('Done!');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
