import { BaseModel } from "../models/baseModel.js";

export class BaseController {
    static async getHome(req, res) {
        try {
            // Render the index view with a title
            res.render('index', {
                title: 'Portfolio | Ganes Yudha Kusuma',
                activePage: 'index'
            });
        } catch (error) {
            // Handle any errors that occur during rendering
            console.error('Error rendering index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getAboutPage(req, res) {
        try {
            const skills = await BaseModel.getListSkill();
            res.render('about', {
                title: 'About | Portfolio Ganes',
                activePage: 'about',
                skills: skills
            });
        } catch (error) {
            console.error('Error rendering about page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getResumePage(req, res) {
        try {
            res.render('resume', {
                title: 'Resume | Portfolio Ganes',
                activePage: 'resume'
            });
        } catch (error) {
            console.error('Error rendering resume page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getProjectPage(req, res) {
        try {
            const { type, project } = await BaseModel.getProjectType();

            res.render('portfolio', {
                title: 'Project | Portfolio Ganes',
                activePage: 'project',
                type,
                project
            });
        } catch (error) {
            console.error('Error rendering portfolio page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getServicePage(req, res) {
        try {
            res.render('services', {
                title: 'Services | Portfolio Ganes',
                activePage: 'services'
            });
        } catch (error) {
            console.error('Error rendering services page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getContactPage(req, res) {
        try {
            res.render('contact', {
                title: 'Contact | Portfolio Ganes',
                activePage: 'contact'
            });
        } catch (error) {
            console.error('Error rendering contact page:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export class DataProcessing {
    static async submitEmail(req, res) {
        try {
            const { name, email, subject, message } = req.body;
            if (!name || !email || !subject || !message) {
                return res.status(400).json({ success: false, message: "All fields are required." });
            }
            const result = await BaseModel.saveEmailData({ name, email, subject, message });
            if (!result.success) {
                return res.status(409).json({ success: false, message: result.message });
            }
            return res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error('Error submit data:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    // Route: /projectDetail/:id
    static async getProjectDetail(req, res) {
        try {
            const idProject = parseInt(req.params.id);
            if (isNaN(idProject)) return res.status(400).send("Invalid ID");
            const project = await BaseModel.getProjectDetail(idProject);

            if (!project || project.length === 0) {
                return res.status(404).render('404', { message: 'Project not found' });
            }

            res.render('portodetail', {
                title: 'Detail Project | Ganes Yudha Kusuma',
                activePage: 'projectdetail',
                project
            });
        } catch (error) {
            console.error('Error rendering portfolio page:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}