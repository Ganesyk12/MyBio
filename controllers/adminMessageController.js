import { EmailModel } from "../models/emailModel.js";

export class AdminMessageController {
    static async getIndex(req, res) {
        try {
            const messages = await EmailModel.adminGetAllMessages();
            res.render('admin/messages/index', {
                title: 'Message Management | Admin Dashboard',
                activePage: 'messages',
                layout: 'admin/layouts/admin',
                messages
            });
        } catch (error) {
            console.error('Error rendering admin messages index:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await EmailModel.adminDeleteMessage(id);
            res.redirect('/centralize/messages');
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
