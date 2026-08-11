"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/types/enums");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const hashedPassword = await bcryptjs_1.default.hash('Password123', 10);
    // 1. Seed 4 Role Users
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@erp.com' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@erp.com',
            password: hashedPassword,
            role: enums_1.Role.ADMIN,
        },
    });
    const salesUser = await prisma.user.upsert({
        where: { email: 'sales@erp.com' },
        update: {},
        create: {
            name: 'Sales Manager',
            email: 'sales@erp.com',
            password: hashedPassword,
            role: enums_1.Role.SALES,
        },
    });
    const warehouseUser = await prisma.user.upsert({
        where: { email: 'warehouse@erp.com' },
        update: {},
        create: {
            name: 'Warehouse Supervisor',
            email: 'warehouse@erp.com',
            password: hashedPassword,
            role: enums_1.Role.WAREHOUSE,
        },
    });
    const accountsUser = await prisma.user.upsert({
        where: { email: 'accounts@erp.com' },
        update: {},
        create: {
            name: 'Accounts Officer',
            email: 'accounts@erp.com',
            password: hashedPassword,
            role: enums_1.Role.ACCOUNTS,
        },
    });
    console.log('✅ Users seeded for all 4 roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS');
    // 2. Seed Demo Customers
    const customer1 = await prisma.customer.upsert({
        where: { id: 'cust-10001-uuid' },
        update: {},
        create: {
            id: 'cust-10001-uuid',
            name: 'Rajesh Kumar',
            mobile: '+919876543210',
            email: 'rajesh@apexdistributors.com',
            businessName: 'Apex Distributors Pvt Ltd',
            gstNumber: '27AAAAA0000A1Z5',
            type: enums_1.CustomerType.WHOLESALE,
            address: 'Plot 42, Industrial Area Phase 2, Mumbai',
            status: enums_1.CustomerStatus.ACTIVE,
            notes: 'Key client for electronics components',
            createdById: salesUser.id,
        },
    });
    const customer2 = await prisma.customer.upsert({
        where: { id: 'cust-10002-uuid' },
        update: {},
        create: {
            id: 'cust-10002-uuid',
            name: 'Anita Verma',
            mobile: '+919123456789',
            email: 'anita@shreetraders.com',
            businessName: 'Shree Electronics & Hardware',
            gstNumber: '27BBBBA1111B1Z2',
            type: enums_1.CustomerType.RETAIL,
            address: 'Shop 14, Main Market, Pune',
            status: enums_1.CustomerStatus.LEAD,
            notes: 'Interested in bulk power bank purchase',
            createdById: salesUser.id,
        },
    });
    console.log('✅ Demo Customers seeded');
    // 3. Seed Demo Products
    const product1 = await prisma.product.upsert({
        where: { sku: 'SKU-PWR-10K' },
        update: {},
        create: {
            name: '10,000mAh Power Bank Fast Charge',
            sku: 'SKU-PWR-10K',
            category: 'Electronics',
            unitPrice: 850.0,
            currentStock: 150,
            minStockAlert: 20,
            location: 'Warehouse Rack A-12',
        },
    });
    const product2 = await prisma.product.upsert({
        where: { sku: 'SKU-CBL-TYPEC' },
        update: {},
        create: {
            name: 'Braided Type-C USB Cable 2M',
            sku: 'SKU-CBL-TYPEC',
            category: 'Accessories',
            unitPrice: 199.0,
            currentStock: 500,
            minStockAlert: 50,
            location: 'Warehouse Bin B-05',
        },
    });
    const product3 = await prisma.product.upsert({
        where: { sku: 'SKU-ADPR-65W' },
        update: {},
        create: {
            name: '65W GaN Fast Wall Charger',
            sku: 'SKU-ADPR-65W',
            category: 'Electronics',
            unitPrice: 1499.0,
            currentStock: 15,
            minStockAlert: 25,
            location: 'Warehouse Rack A-15',
        },
    });
    console.log('✅ Demo Products seeded');
    // 4. Seed Initial Stock Movement Audit Logs
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: product1.id,
                quantity: 150,
                type: enums_1.MovementType.IN,
                reason: 'Initial Warehouse Inwarding Batch #001',
                createdById: warehouseUser.id,
            },
            {
                productId: product2.id,
                quantity: 500,
                type: enums_1.MovementType.IN,
                reason: 'Initial Warehouse Inwarding Batch #001',
                createdById: warehouseUser.id,
            },
            {
                productId: product3.id,
                quantity: 15,
                type: enums_1.MovementType.IN,
                reason: 'Initial Warehouse Inwarding Batch #001',
                createdById: warehouseUser.id,
            },
        ],
    });
    console.log('✅ Initial Stock Movements logged');
    console.log('🎉 Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
