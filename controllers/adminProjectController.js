import { ProjectModel } from "../models/projectModel.js";
import { SkillModel } from "../models/skillModel.js";

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
            await ProjectModel.adminCreateProject(req.body);
            res.redirect('/centralize/projects');
        } catch (error) {
            console.error('Error creating project:', error);
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
            await ProjectModel.adminUpdateProject(req.params.id, req.body);
            res.redirect('/centralize/projects');
        } catch (error) {
            console.error('Error updating project:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await ProjectModel.adminDeleteProject(id);
            res.redirect('/centralize/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
