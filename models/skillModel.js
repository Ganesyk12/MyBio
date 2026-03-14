import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";

export class SkillModel {
    static async getListSkill() {
        try {
            const skills = await withTimeout(prisma.skill.findMany({
                orderBy: { SkillName: 'asc' },
                where: { Status: 'A' }
            }));
            return skills;
        } catch (error) {
            throw new Error("Failed to retrieve skills");
        }
    }

    static async adminGetAllSkills() {
        try {
            const skills = await withTimeout(prisma.skill.findMany({
                orderBy: { DateCreated: 'desc' }
            }));
            return skills;
        } catch (error) {
            console.error("🔥 Prisma error admin skills:", error);
            throw new Error("Failed to retrieve all skills");
        }
    }

    static async adminGetSkillById(id) {
        try {
            const skill = await withTimeout(prisma.skill.findUnique({
                where: { IdSkill: Number(id) }
            }));
            return skill;
        } catch (error) {
            console.error("🔥 Prisma error retrieving skill:", error);
            throw new Error("Failed to retrieve skill");
        }
    }

    static async adminCreateSkill(data) {
        try {
            const skill = await withTimeout(prisma.skill.create({
                data: {
                    SkillName: data.SkillName,
                    Status: data.Status || 'A',
                    Icon: data.Icon || null
                }
            }));
            return skill;
        } catch (error) {
            console.error("🔥 Prisma error creating skill:", error);
            throw new Error("Failed to create skill");
        }
    }

    static async adminUpdateSkill(id, data) {
        try {
            const skill = await withTimeout(prisma.skill.update({
                where: { IdSkill: Number(id) },
                data: {
                    SkillName: data.SkillName,
                    Status: data.Status,
                    Icon: data.Icon
                }
            }));
            return skill;
        } catch (error) {
            console.error("🔥 Prisma error updating skill:", error);
            throw new Error("Failed to update skill");
        }
    }

    static async adminDeleteSkill(id) {
        try {
            await withTimeout(prisma.skill.update({
                where: { IdSkill: Number(id) },
                data: { Status: 'N' }
            }));
            return true;
        } catch (error) {
            console.error("🔥 Prisma error deleting skill:", error);
            throw new Error("Failed to delete skill");
        }
    }
}
