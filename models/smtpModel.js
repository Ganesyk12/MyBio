import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";

export class SmtpModel {
    static async adminGetAllSmtp() {
        try {
            return await withTimeout(prisma.smtpEmail.findMany({
                orderBy: { DateCreated: 'desc' }
            }));
        } catch (error) {
            console.error("🔥 Prisma error retrieving SMTPs:", error);
            throw new Error("Failed to retrieve SMTPs");
        }
    }

    static async adminGetSmtpById(id) {
        try {
            return await withTimeout(prisma.smtpEmail.findUnique({
                where: { IdSmtp: Number(id) }
            }));
        } catch (error) {
            console.error("🔥 Prisma error retrieving SMTP:", error);
            throw new Error("Failed to retrieve SMTP");
        }
    }

    static async adminCreateSmtp(data) {
        try {
            return await withTimeout(prisma.smtpEmail.create({
                data: {
                    Host: data.Host,
                    Port: Number(data.Port),
                    EnableSSL: data.EnableSSL === 'true' || data.EnableSSL === '1',
                    SenderName: data.SenderName,
                    SenderEmail: data.SenderEmail,
                    Username: data.Username,
                    Password: data.Password,
                    IsActive: data.IsActive === 'true' || data.IsActive === '1',
                    Status: data.Status || 'A',
                    UserCreated: data.UserCreated || 'System'
                }
            }));
        } catch (error) {
            console.error("🔥 Prisma error creating SMTP:", error);
            throw new Error("Failed to create SMTP");
        }
    }

    static async adminUpdateSmtp(id, data) {
        try {
            return await withTimeout(prisma.smtpEmail.update({
                where: { IdSmtp: Number(id) },
                data: {
                    Host: data.Host,
                    Port: Number(data.Port),
                    EnableSSL: data.EnableSSL === 'true' || data.EnableSSL === '1',
                    SenderName: data.SenderName,
                    SenderEmail: data.SenderEmail,
                    Username: data.Username,
                    Password: data.Password,
                    IsActive: data.IsActive === 'true' || data.IsActive === '1',
                    Status: data.Status || 'A',
                    UserModified: data.UserModified || 'System'
                }
            }));
        } catch (error) {
            console.error("🔥 Prisma error updating SMTP:", error);
            throw new Error("Failed to update SMTP");
        }
    }

    static async adminDeleteSmtp(id) {
        try {
            // Soft delete
            return await withTimeout(prisma.smtpEmail.update({
                where: { IdSmtp: Number(id) },
                data: { Status: 'N' }
            }));
        } catch (error) {
            console.error("🔥 Prisma error deleting SMTP:", error);
            throw new Error("Failed to delete SMTP");
        }
    }
}
