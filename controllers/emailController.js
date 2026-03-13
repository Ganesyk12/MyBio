import { EmailModel } from "../models/emailModel.js";

export class EmailController {
    static async submitEmail(req, res) {
        try {
            const { name, email, subject, message } = req.body;
            if (!name || !email || !subject || !message) {
                return res.status(400).json({ success: false, message: "All fields are required." });
            }
            const result = await EmailModel.saveEmailData({ name, email, subject, message });
            if (!result.success) {
                return res.status(409).json({ success: false, message: result.message });
            }
            return res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error('Error submit data:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}
