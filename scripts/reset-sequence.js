import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAllSequences() {
    try {
        // Reset Project sequence
        const maxProject = await prisma.$queryRaw`
            SELECT COALESCE(MAX("IdProject"), 0) as max_id FROM "Project"
        `;
        const maxIdProject = maxProject[0]?.max_id || 0;
        const nextIdProject = maxIdProject + 1;
        
        await prisma.$executeRawUnsafe(`
            SELECT setval('"Project_IdProject_seq"', ${nextIdProject}, false)
        `);
        console.log(`✅ Project sequence reset. Next IdProject: ${nextIdProject}`);
        
        // Reset ProjectDetail sequence
        const maxDetail = await prisma.$queryRaw`
            SELECT COALESCE(MAX("IdProjectDetail"), 0) as max_id FROM "ProjectDetail"
        `;
        const maxIdDetail = maxDetail[0]?.max_id || 0;
        const nextIdDetail = maxIdDetail + 1;
        
        await prisma.$executeRawUnsafe(`
            SELECT setval('"ProjectDetail_IdProjectDetail_seq"', ${nextIdDetail}, false)
        `);
        console.log(`✅ ProjectDetail sequence reset. Next IdProjectDetail: ${nextIdDetail}`);
        
        // Reset other sequences if needed
        const tables = [
            { table: 'ProjectType', column: 'IdType', seq: 'ProjectType_IdType_seq' },
            { table: 'Skill', column: 'IdSkill', seq: 'Skill_IdSkill_seq' },
            { table: 'EmailReceive', column: 'IdMail', seq: 'EmailReceive_IdMail_seq' }
        ];
        
        for (const { table, column, seq } of tables) {
            try {
                const maxResult = await prisma.$queryRawUnsafe(
                    `SELECT COALESCE(MAX("${column}"), 0) as max_id FROM "${table}"`
                );
                const maxId = maxResult[0]?.max_id || 0;
                const nextId = maxId + 1;
                
                await prisma.$executeRawUnsafe(`
                    SELECT setval('"${seq}"', ${nextId}, false)
                `);
                console.log(`✅ ${table} sequence reset. Next ${column}: ${nextId}`);
            } catch (e) {
                console.log(`⚠️  Skip ${table}: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetAllSequences();
