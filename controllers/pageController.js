import { SkillModel } from "../models/skillModel.js";

export class PageController {
    static async getHome(req, res) {
        try {
            const isAjax = req.xhr;
            res.render('index', {
                title: 'Portfolio | Ganes Yudha Kusuma',
                activePage: 'index',
                layout: isAjax ? false : 'layouts/main'
            });
        } catch (error) {
            console.error('Error rendering index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getAboutPage(req, res) {
        try {
            const skills = await SkillModel.getListSkill();
            const isAjax = req.xhr;
            res.render('about', {
                title: 'About | Portfolio Ganes',
                activePage: 'about',
                skills: skills,
                layout: isAjax ? false : 'layouts/main'
            });
        } catch (error) {
            console.error('Error rendering about page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getResumePage(req, res) {
        try {
            const isAjax = req.xhr;
            res.render('resume', {
                title: 'Resume | Portfolio Ganes',
                activePage: 'resume',
                layout: isAjax ? false : 'layouts/main'
            });
        } catch (error) {
            console.error('Error rendering resume page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getServicePage(req, res) {
        try {
            const isAjax = req.xhr;
            res.render('services', {
                title: 'Services | Portfolio Ganes',
                activePage: 'services',
                layout: isAjax ? false : 'layouts/main'
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
