import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";

export class EmailModel {
    static getTodayRange = (offsetHours = 7) => {
        // Ambil rentang hari ini (UTC+7)
        const now = new Date();
        const start = new Date(now);
        start.setUTCHours(0 - offsetHours, 0, 0, 0);
        const end = new Date(now);
        end.setUTCHours(23 - offsetHours, 59, 59, 999);
        return { startOfToday: start, endOfToday: end };
    };

    static getTodayDateRange = () => {
        const today = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const local = new Date(today.getTime() + offset);
        const dateOnly = local.toISOString().slice(0, 10); // yyyy-mm-dd
        return {
            startOfToday: new Date(`${dateOnly}T00:00:00.000+07:00`),
            endOfToday: new Date(`${dateOnly}T23:59:59.999+07:00`)
        };
    };

    static async saveEmailData(data) {
        try {
            const { name, email, subject, message } = data;
            const { startOfToday, endOfToday } = this.getTodayDateRange();
            // Cek apakah email dengan alamat yang sama sudah dikirim hari ini
            const existing = await withTimeout(prisma.emailReceive.findFirst({
                where: {
                    Email: email,
                    DateCreate: {
                        gte: startOfToday,
                        lte: endOfToday
                    }
                }
            }));
            if (existing) {
                return {
                    success: false,
                    message: "Email already submitted today. Try Again Tomorrow"
                };
            }
            // Simpan data baru
            await withTimeout(prisma.emailReceive.create({
                data: {
                    Name: name,
                    Email: email,
                    Subject: subject,
                    Message: message,
                    Status: "A"
                }
            }));
            return {
                success: true,
                message: "Email saved successfully."
            };
        } catch (error) {
            console.error("Error saving email data:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async adminGetAllMessages() {
        try {
            const messages = await withTimeout(prisma.emailReceive.findMany({
                orderBy: { DateCreate: 'desc' }
            }));
            return messages;
        } catch (error) {
            console.error("🔥 Prisma error admin messages:", error);
            throw new Error("Failed to retrieve all messages");
        }
    }

    static async adminDeleteMessage(id) {
        try {
            await withTimeout(prisma.emailReceive.update({
                where: { IdMail: Number(id) },
                data: { Status: 'N' }
            }));
            return true;
        } catch (error) {
            console.error("🔥 Prisma error deleting message:", error);
            throw new Error("Failed to delete message");
        }
    }
}
