import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";

export class AdminController {
    static async getDashboard(req, res) {
        try {
            // Fetch summary counts
            const [totalProjects, totalSkills, totalMessages, totalProjectTypes, totalProjectDetails] = await Promise.all([
                withTimeout(prisma.project.count()),
                withTimeout(prisma.skill.count({ where: { Status: 'A' } })),
                withTimeout(prisma.emailReceive.count()),
                withTimeout(prisma.projectType.count()),
                withTimeout(prisma.projectDetail.count()),
            ]);

            // Fetch recent projects (latest 5)
            const recentProjects = await withTimeout(prisma.project.findMany({
                orderBy: { DateCreated: 'desc' },
                take: 5,
                include: {
                    ProjectType: {
                        select: { TypeName: true }
                    }
                }
            }));

            // Fetch active skills
            const skills = await withTimeout(prisma.skill.findMany({
                where: { Status: 'A' },
                orderBy: { SkillName: 'asc' }
            }));

            // Fetch recent messages (latest 10)
            const recentMessages = await withTimeout(prisma.emailReceive.findMany({
                orderBy: { DateCreate: 'desc' },
                take: 10
            }));

            // Fetch project types with project count
            const projectTypes = await withTimeout(prisma.projectType.findMany({
                orderBy: { TypeName: 'asc' },
                include: {
                    _count: {
                        select: { Project: true }
                    }
                }
            }));

            res.render('admin/dashboard', {
                title: 'Admin Dashboard | MyBio',
                activePage: 'dashboard',
                layout: 'admin/layouts/admin',
                totalProjects,
                totalSkills,
                totalMessages,
                totalProjectTypes,
                totalProjectDetails,
                recentProjects,
                skills,
                recentMessages,
                projectTypes
            });
        } catch (error) {
            console.error('Error rendering admin dashboard:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
