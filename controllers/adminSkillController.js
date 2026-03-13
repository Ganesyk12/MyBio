import { SkillModel } from "../models/skillModel.js";

export class AdminSkillController {
    static async getIndex(req, res) {
        try {
            const skills = await SkillModel.adminGetAllSkills();
            res.render('admin/skills/index', {
                title: 'Skill Management | Admin Dashboard',
                activePage: 'skills',
                layout: 'admin/layouts/admin',
                skills
            });
        } catch (error) {
            console.error('Error rendering admin skill index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getCreate(req, res) {
        try {
            res.render('admin/skills/create', { 
                layout: 'admin/layouts/admin', 
                title: 'Create Skill'
            });
        } catch (error) {
            console.error('Error rendering skill create form:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postCreate(req, res) {
        try {
            await SkillModel.adminCreateSkill(req.body);
            res.redirect('/centralize/skills');
        } catch (error) {
            console.error('Error creating skill:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getEdit(req, res) {
        try {
            const skill = await SkillModel.adminGetSkillById(req.params.id);
            if (!skill) return res.status(404).send('Skill not found');
            res.render('admin/skills/edit', { 
                layout: 'admin/layouts/admin', 
                title: 'Edit Skill',
                skill 
            });
        } catch (error) {
            console.error('Error getting skill for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postEdit(req, res) {
        try {
            await SkillModel.adminUpdateSkill(req.params.id, req.body);
            res.redirect('/centralize/skills');
        } catch (error) {
            console.error('Error updating skill:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await SkillModel.adminDeleteSkill(id);
            res.redirect('/centralize/skills');
        } catch (error) {
            console.error('Error deleting skill:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
