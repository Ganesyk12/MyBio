import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";

export class ProjectModel {
    static async getProjectType() {
        try {
            const type = await withTimeout(
                prisma.projectType.findMany({
                    orderBy: { TypeName: 'asc' },
                    select: {
                        IdType: true,
                        TypeName: true
                    }
                }));
            // Ambil semua project dan detail + type-nya
            const project = await withTimeout(
                prisma.project.findMany({
                    orderBy: { IdProject: 'asc' },
                    select: {
                        IdProject: true,
                        ProjectName: true,
                        ProjectType: {
                            select: {
                                IdType: true,
                                TypeName: true
                            }
                        },
                        ProjectDetail: {
                            select: {
                                FilePath: true
                            },
                            take: 1
                        }
                    }
                })
            );
            // Gabungkan data ProjectType ke dalam tiap project
            const formattedProjects = project.map(p => ({
                IdProject: p.IdProject,
                ProjectName: p.ProjectName,
                TypeName: p.ProjectType.TypeName,
                IdType: p.ProjectType.IdType,
                FilePath: p.ProjectDetail?.[0]?.FilePath || null
            }));
            return { type, project: formattedProjects };
        } catch (error) {
            throw new Error("Failed to retrieve type");
        }
    }

    static async getProjectDetail(idProject) {
        try {
            const projects = await withTimeout(prisma.project.findFirst({
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
                        take: 10,
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
            }));

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

    static async adminGetAllProjects() {
        try {
            const projects = await withTimeout(prisma.project.findMany({
                orderBy: { DateCreated: 'desc' },
                include: {
                    ProjectType: true,
                    ProjectDetail: {
                        include: {
                            Skill: true
                        }
                    }
                }
            }));
            return projects;
        } catch (error) {
            console.error("🔥 Prisma error admin projects:", error);
            throw new Error("Failed to retrieve all projects");
        }
    }

    static async adminGetAllProjectTypes() {
        try {
            return await withTimeout(prisma.projectType.findMany({
                orderBy: { TypeName: 'asc' }
            }));
        } catch (error) {
            console.error("🔥 Prisma error retrieving project types:", error);
            throw new Error("Failed to retrieve project types");
        }
    }

    static async adminGetProjectById(id) {
        try {
            const project = await withTimeout(prisma.project.findUnique({
                where: { IdProject: Number(id) },
                include: {
                    ProjectType: true,
                    ProjectDetail: {
                        include: {
                            Skill: true
                        }
                    }
                }
            }));
            return project;
        } catch (error) {
            console.error("🔥 Prisma error retrieving project:", error);
            throw new Error("Failed to retrieve project");
        }
    }

    static async adminCreateProject(data) {
        try {
            // Create Project and its initial Detail in a transaction or nested write
            const project = await withTimeout(prisma.project.create({
                data: {
                    ProjectName: data.ProjectName,
                    IdType: Number(data.IdType),
                    Status: 'A',
                    ProjectDetail: {
                        create: {
                            Description: data.Description || "",
                            FilePath: data.FilePath || "",
                            Link: data.Link || null,
                            IdSkill: data.IdSkill ? Number(data.IdSkill) : 1 // arbitrary fallback, ideally frontend ensures this
                        }
                    }
                }
            }));
            return project;
        } catch (error) {
            console.error("🔥 Prisma error creating project:", error);
            throw new Error("Failed to create project");
        }
    }

    static async adminUpdateProject(id, data) {
        try {
            const project = await withTimeout(prisma.project.update({
                where: { IdProject: Number(id) },
                data: {
                    ProjectName: data.ProjectName,
                    IdType: Number(data.IdType),
                    Status: data.Status || 'A'
                }
            }));

            // Handle ProjectDetail: update if exists, create if not
            if (data.Description || data.FilePath || data.Link || data.IdSkill) {
               const firstDetail = await prisma.projectDetail.findFirst({
                   where: { IdProject: Number(id) }
               });
               
               if(firstDetail){
                   // Update existing detail
                   await prisma.projectDetail.update({
                       where: { IdProjectDetail: firstDetail.IdProjectDetail },
                       data: {
                           Description: data.Description || firstDetail.Description,
                           FilePath: data.FilePath || firstDetail.FilePath,
                           Link: data.Link || firstDetail.Link,
                           IdSkill: data.IdSkill ? Number(data.IdSkill) : firstDetail.IdSkill
                       }
                   });
               } else {
                   // Create new detail if none exists
                   await prisma.projectDetail.create({
                       data: {
                           IdProject: Number(id),
                           Description: data.Description || "",
                           FilePath: data.FilePath || "",
                           Link: data.Link || null,
                           IdSkill: data.IdSkill ? Number(data.IdSkill) : 1
                       }
                   });
               }
            }

            return project;
        } catch (error) {
            console.error("🔥 Prisma error updating project:", error);
            throw new Error("Failed to update project");
        }
    }

    static async adminDeleteProject(id) {
        try {
            await withTimeout(prisma.project.update({
                where: { IdProject: Number(id) },
                data: { Status: 'N' }
            }));
            return true;
        } catch (error) {
            console.error("🔥 Prisma error deleting project:", error);
            throw new Error("Failed to delete project");
        }
    }
}
