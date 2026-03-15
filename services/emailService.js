import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { prisma } from '../lib/prismaClient.js';

export const forwardUnreadEmails = async () => {
    try {
        console.log('⏳ [Email Service] Starting daily email check...');
        
        // 1. Get Active SMTP Configuration
        const smtpConfig = await prisma.smtpEmail.findFirst({
            where: {
                IsActive: true,
                Status: { not: 'N' } // Ensure it's not deleted. Allow 'A' or null
            }
        });

        if (!smtpConfig) {
            console.warn('⚠️ [Email Service] No active SMTP configuration found. Aborting...');
            return;
        }

        // 2. Fetch Unread Messages (Status 'A')
        const unreadMessages = await prisma.emailReceive.findMany({
            where: {
                Status: 'A'
            }
        });

        if (unreadMessages.length === 0) {
            console.log('✅ [Email Service] No new unread messages to forward.');
            return;
        }

        console.log(`✉️ [Email Service] Found ${unreadMessages.length} unread message(s) to forward.`);

        // 3. Setup Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: smtpConfig.Host,
            port: smtpConfig.Port,
            secure: smtpConfig.Port === 465, // Force true for 465, false for 587/others
            auth: {
                user: smtpConfig.Username,
                pass: smtpConfig.Password
            },
            tls: {
                // Do not fail on invalid certificates (common on shared hosting)
                rejectUnauthorized: false
            }
        });

        // 4. Loop through and send
        for (const message of unreadMessages) {
            try {
                const mailOptions = {
                    from: `"${smtpConfig.SenderName}" <${smtpConfig.SenderEmail}>`, // sender address
                    to: 'ganesyudhakusuma@gmail.com', // list of receivers
                    subject: `[Portfolio Inbox] New Message from ${message.Name}`, // Subject line
                    html: `
                        <h3>New Contact Form Submission</h3>
                        <p><strong>From:</strong> ${message.Name} (${message.Email})</p>
                        <p><strong>Date:</strong> ${new Date(message.DateCreate).toLocaleString('id-ID')}</p>
                        <p><strong>Subject:</strong> ${message.Subject}</p>
                        <hr>
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap;">${message.Message}</p>
                    `, // html body
                };

                // Send mail
                await transporter.sendMail(mailOptions);
                console.log(`✅ [Email Service] Successfully forwarded message from ${message.Email}`);

                // Update Status to 'R'
                await prisma.emailReceive.update({
                    where: { IdMail: message.IdMail },
                    data: { Status: 'R' }
                });

            } catch (err) {
                console.error(`❌ [Email Service] Failed to forward message from ${message.Email}:`, err.message);
            }
        }

        console.log('🎉 [Email Service] Daily email forwarding process completed.');

    } catch (error) {
        console.error('🔥 [Email Service] Critical error during email execution:', error);
    }
};

// Initialize Cron Job to run daily at 06:00 AM
export const initEmailCronJob = () => {
    // Cron schedule: "0 6 * * *" = at 06:00 AM every day
    // You can specify the timezone to ensure it's exact in your local time
    cron.schedule('0 6 * * *', () => {
        forwardUnreadEmails();
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta" // Adjust to your server timezone
    });
    
    console.log('⏰ [Cron] Email forwarding scheduled for 06:00 AM daily (Asia/Jakarta time).');
};
