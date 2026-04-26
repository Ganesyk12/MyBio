import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRawUnsafe(`
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'Portfolio' 
            AND table_name = 'UserLogin' 
            AND column_name = 'IdUserLogin'
        `);
        console.log('Column Info:', result);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
