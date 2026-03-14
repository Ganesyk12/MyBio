import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setDatabaseEncoding() {
    try {
        // Cek encoding saat ini
        const currentEncoding = await prisma.$queryRaw`
            SHOW server_encoding;
        `;
        console.log('Current server encoding:', currentEncoding);
        
        // Set client encoding untuk database
        await prisma.$executeRawUnsafe(`
            ALTER DATABASE postgres SET client_encoding TO 'UTF8';
        `);
        
        console.log('✅ Database encoding set to UTF8');
        
        // Verify
        const newEncoding = await prisma.$queryRaw`
            SHOW client_encoding;
        `;
        console.log('New client encoding:', newEncoding);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setDatabaseEncoding();
