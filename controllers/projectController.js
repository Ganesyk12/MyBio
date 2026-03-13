import { ProjectModel } from "../models/projectModel.js";

export class ProjectController {
    static async getProjectPage(req, res) {
        try {
            const { type, project } = await ProjectModel.getProjectType();
            res.render('portfolio', {
                title: 'Project | Portfolio Ganes',
                activePage: 'portfolio',
                type,
                project,
            });
        } catch (error) {
            console.error('Error rendering portfolio page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getProjectDetail(req, res) {
        try {
            const isAjax = req.xhr;
            const idProject = parseInt(req.params.id);

            if (isNaN(idProject)) return res.status(400).send("Invalid ID");

            const project = await ProjectModel.getProjectDetail(idProject);
            if (!project || project.length === 0) {
                return res.status(404).render('404', {
                    message: 'Project not found'
                });
            }

            res.render('portodetail', {
                title: 'Detail Project | Ganes Yudha Kusuma',
                activePage: 'portfolio',
                project,
                layout: isAjax ? false : 'layouts/main'
            });
        } catch (error) {
            console.error('Error rendering portfolio page:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
