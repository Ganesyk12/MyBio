import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class UniversModel {
    static async getListSkill() {
        try {
            const skills = await prisma.skill.findMany({
                orderBy: { SkillName: 'asc' },
                where: { Status: 'A' }
            });
            return skills;
        } catch (error) {
            throw new Error("Failed to retrieve skills");
        }
    }

    static async getProjectType() {
        try {
            const type = await prisma.projectType.findMany({
                orderBy: { TypeName: 'asc' },
                select: {
                    IdType: true,
                    TypeName: true
                }
            });
            // Ambil semua project dan detail + type-nya
            const project = await prisma.project.findMany({
                include: {
                    ProjectDetail: {
                        select: { FilePath: true }
                    },
                    ProjectType: {
                        select: { TypeName: true, IdType: true }
                    }
                },
                orderBy: { IdProject: 'asc' }
            });
            // Gabungkan data ProjectType ke dalam tiap project
            const formattedProjects = project.map(p => ({
                ...p,
                TypeName: p.ProjectType.TypeName,
                IdType: p.ProjectType.IdType
            }));
            return { type, project: formattedProjects };
        } catch (error) {
            throw new Error("Failed to retrieve type");
        }
    }

    static async getProjectDetail(idProject) {
        try {
            const projects = await prisma.project.findFirst({
                where: { IdProject: Number(idProject) },
                select: {
                    IdProject: true,
                    ProjectName: true,
                    ProjectType: {
                        select: {
                            TypeName: true
                        }
                    },
                    ProjectDetail: {
                        select: {
                            FilePath: true,
                            Description: true,
                            DateCreated: true,
                            Link: true,
                            Skill: {
                                select: {
                                    SkillName: true
                                }
                            }
                        }
                    }
                }
            });

            if (!projects) {
                throw new Error("Project not found");
            }
            return {
                IdProject: projects.IdProject,
                ProjectName: projects.ProjectName,
                TypeName: projects.ProjectType.TypeName,
                ProjectDetail: projects.ProjectDetail.map(detail => ({
                    FilePath: detail.FilePath,
                    Description: detail.Description,
                    DateCreated: detail.DateCreated,
                    SkillName: detail.Skill?.SkillName || null,
                    Link: detail.Link
                }))
            };
        } catch (error) {
            console.error("🔥 Prisma error detail:", error);
            throw new Error("Failed to retrieve project summary");
        }
    }

    static getTodayRange = (offsetHours = 7) => {
        // Ambil rentang hari ini (UTC+7)
        const now = new Date();
        const start = new Date(now);
        start.setUTCHours(0 - offsetHours, 0, 0, 0);
        const end = new Date(now);
        end.setUTCHours(23 - offsetHours, 59, 59, 999);
        return { startOfToday: start, endOfToday: end };
    };

    static getTodayDateRange = () => {
        const today = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const local = new Date(today.getTime() + offset);
        const dateOnly = local.toISOString().slice(0, 10); // yyyy-mm-dd
        return {
            startOfToday: new Date(`${dateOnly}T00:00:00.000+07:00`),
            endOfToday: new Date(`${dateOnly}T23:59:59.999+07:00`)
        };
    };

    static async saveEmailData(data) {
        try {
            const { name, email, subject, message } = data;
            const { startOfToday, endOfToday } = this.getTodayDateRange();
            // Cek apakah email dengan alamat yang sama sudah dikirim hari ini
            const existing = await prisma.emailReceive.findFirst({
                where: {
                    Email: email,
                    DateCreate: {
                        gte: startOfToday,
                        lte: endOfToday
                    }
                }
            });
            if (existing) {
                return {
                    success: false,
                    message: "Email already submitted today. Try Again Tomorrow"
                };
            }
            // Simpan data baru
            await prisma.emailReceive.create({
                data: {
                    Name: name,
                    Email: email,
                    Subject: subject,
                    Message: message,
                    Status: "A"
                }
            });
            return {
                success: true,
                message: "Email saved successfully."
            };
        } catch (error) {
            console.error("Error saving email data:", error);
            throw new Error("Internal Server Error");
        }
    }
}