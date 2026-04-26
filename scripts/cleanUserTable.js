import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking tables in Portfolio schema...');
        const tables = await prisma.$queryRawUnsafe(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'Portfolio'
        `);
        console.log('Tables found:', tables);

        console.log('Cleaning UserLogin table in Portfolio schema...');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Portfolio"."UserLogin" RESTART IDENTITY CASCADE;');
        console.log('Table cleaned.');
        
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
