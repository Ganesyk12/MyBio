import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

            const cvUploadDir = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../public/uploads');
            const cvPath = path.join(cvUploadDir, 'cv.pdf');
            const cvExists = fs.existsSync(cvPath);

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
                projectTypes,
                cvExists,
                error: req.query.error,
                success: req.query.success
            });
        } catch (error) {
            console.error('Error rendering admin dashboard:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postUploadCV(req, res) {
        try {
            if (!req.file) {
                return res.redirect('/centralize?error=No+file+uploaded');
            }
            res.redirect('/centralize?success=CV+uploaded+successfully');
        } catch (error) {
            console.error('Error in postUploadCV:', error);
            res.redirect('/centralize?error=Internal+Server+Error');
        }
    }
}
