import { SmtpModel } from "../models/smtpModel.js";

export class AdminSmtpController {
    static async getIndex(req, res) {
        try {
            const smtps = await SmtpModel.adminGetAllSmtp();
            res.render('admin/smtp/index', {
                title: 'SMTP Configuration | Admin Dashboard',
                activePage: 'smtp',
                layout: 'admin/layouts/admin',
                smtps
            });
        } catch (error) {
            console.error('Error rendering SMTP index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getCreate(req, res) {
        try {
            res.render('admin/smtp/create', { 
                layout: 'admin/layouts/admin', 
                title: 'Add SMTP Configuration'
            });
        } catch (error) {
            console.error('Error rendering SMTP create form:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postCreate(req, res) {
        try {
            await SmtpModel.adminCreateSmtp(req.body);
            res.redirect('/centralize/smtp');
        } catch (error) {
            console.error('Error creating SMTP:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getEdit(req, res) {
        try {
            const smtp = await SmtpModel.adminGetSmtpById(req.params.id);
            if (!smtp) return res.status(404).send('SMTP config not found');
            
            res.render('admin/smtp/edit', { 
                layout: 'admin/layouts/admin', 
                title: 'Edit SMTP Configuration',
                smtp 
            });
        } catch (error) {
            console.error('Error getting SMTP for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postEdit(req, res) {
        try {
            await SmtpModel.adminUpdateSmtp(req.params.id, req.body);
            res.redirect('/centralize/smtp');
        } catch (error) {
            console.error('Error updating SMTP:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async delete(req, res) {
        try {
            await SmtpModel.adminDeleteSmtp(req.params.id);
            res.redirect('/centralize/smtp');
        } catch (error) {
            console.error('Error deleting SMTP:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
