// prisma/seed.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create a Test User
    const user = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
            email: 'alice@example.com',
            fullName: 'Alice Johnson',
            loyaltyPoints: 150,
            tier: 'SILVER',
        },
    })
    console.log(`👤 Created user: ${user.fullName}`)

    // 2. Create Products
    const products = [
        {
            sku: 'DRS-RED-001',
            name: 'Summer Floral Red Dress',
            description: 'A breezy red dress with floral patterns.',
            price: 49.99,
            category: 'Apparel',
            imageUrl: 'https://example.com/red-dress.jpg',
        },
        {
            sku: 'SHR-BLU-002',
            name: 'Classic Denim Shirt',
            description: 'Rugged blue denim shirt.',
            price: 29.99,
            category: 'Apparel',
            imageUrl: 'https://example.com/blue-shirt.jpg',
        }
    ]

    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: p,
        })
        console.log(`📦 Created product: ${product.name}`)

        // 3. Add Inventory
        if (p.sku === 'DRS-RED-001') {
            await prisma.inventory.createMany({
                data: [
                    { productId: product.id, location: 'Mall of India', quantity: 5, aisle: 'Row 3' },
                    { productId: product.id, location: 'Main Warehouse', quantity: 0, aisle: 'Zone B' },
                ],
                skipDuplicates: true,
            })
        } else {
            await prisma.inventory.createMany({
                data: [{ productId: product.id, location: 'Main Warehouse', quantity: 10, aisle: 'Zone A' }],
                skipDuplicates: true,
            })
        }
    }

    console.log('✅ Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })