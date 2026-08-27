import { ProjectModel } from "../models/projectModel.js";
import { SkillModel } from "../models/skillModel.js";
import { isR2Configured, uploadToR2, deleteFromR2 } from "../services/r2Service.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function handleFileUpload(file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;

    if (isR2Configured()) {
        return await uploadToR2({
            fileBuffer: file.buffer,
            fileName: fileName,
            contentType: file.mimetype,
            folder: 'portfolio'
        });
    } else {
        // Fallback local storage
        const uploadDir = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../public/img/portfolio');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
        return `/img/portfolio/${fileName}`;
    }
}

export class AdminProjectController {
    static async getIndex(req, res) {
        try {
            const projects = await ProjectModel.adminGetAllProjects();
            res.render('admin/projects/index', {
                title: 'Project Management | Admin Dashboard',
                activePage: 'projects',
                layout: 'admin/layouts/admin',
                projects
            });
        } catch (error) {
            console.error('Error rendering admin project index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getCreate(req, res) {
        try {
            const types = await ProjectModel.adminGetAllProjectTypes();
            const skills = await SkillModel.adminGetAllSkills();

            res.render('admin/projects/create', { 
                layout: 'admin/layouts/admin', 
                title: 'Create Project',
                types,
                skills
            });
        } catch (error) {
            console.error('Error rendering project create form:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postCreate(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.FilePath = await handleFileUpload(req.file);
            }

            await ProjectModel.adminCreateProject(data);
            res.redirect('/centralize/projects?success=' + encodeURIComponent('Project created successfully!'));
        } catch (error) {
            console.error('Error creating project:', error);
            res.redirect('/centralize/projects?error=' + encodeURIComponent('Failed to create project: ' + error.message));
        }
    }

    static async getDetail(req, res) {
        try {
            const project = await ProjectModel.adminGetProjectById(req.params.id);
            if (!project) return res.status(404).send('Project not found');
            
            res.render('admin/projects/detail', { 
                layout: 'admin/layouts/admin', 
                title: 'Project Detail',
                project 
            });
        } catch (error) {
            console.error('Error getting project detail:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getEdit(req, res) {
        try {
            const project = await ProjectModel.adminGetProjectById(req.params.id);
            if (!project) return res.status(404).send('Project not found');
            
            const types = await ProjectModel.adminGetAllProjectTypes();
            const skills = await SkillModel.adminGetAllSkills();

            res.render('admin/projects/edit', { 
                layout: 'admin/layouts/admin', 
                title: 'Edit Project',
                project,
                types,
                skills
            });
        } catch (error) {
            console.error('Error getting project for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postEdit(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.FilePath = await handleFileUpload(req.file);

                // Delete old image from R2 if applicable
                try {
                    const existingProject = await ProjectModel.adminGetProjectById(req.params.id);
                    const oldFilePath = existingProject?.ProjectDetail?.[0]?.FilePath;
                    if (oldFilePath && oldFilePath.startsWith('http')) {
                        await deleteFromR2(oldFilePath);
                    }
                } catch (delErr) {
                    console.warn('Could not delete old file from R2:', delErr.message);
                }
            }

            await ProjectModel.adminUpdateProject(req.params.id, data);
            res.redirect('/centralize/projects?success=' + encodeURIComponent('Project updated successfully!'));
        } catch (error) {
            console.error('Error updating project:', error);
            res.redirect('/centralize/projects?error=' + encodeURIComponent('Failed to update project: ' + error.message));
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await ProjectModel.adminDeleteProject(id);
            res.redirect('/centralize/projects?success=' + encodeURIComponent('Project deleted successfully!'));
        } catch (error) {
            console.error('Error deleting project:', error);
            res.redirect('/centralize/projects?error=' + encodeURIComponent('Failed to delete project: ' + error.message));
        }
    }
}

