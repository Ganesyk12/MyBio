import { prisma } from "../lib/prismaClient.js";
import { withTimeout } from "../utils/withTimeout.js";
import bcrypt from "bcrypt";

export class UserLoginModel {
    static async adminGetAllUsers() {
        try {
            const users = await withTimeout(prisma.userLogin.findMany({
                orderBy: { DateCreated: 'desc' }
            }));
            return users;
        } catch (error) {
            console.error("🔥 Prisma error admin users:", error);
            throw new Error("Failed to retrieve all users");
        }
    }

    static async adminGetUserById(id) {
        try {
            const user = await withTimeout(prisma.userLogin.findUnique({
                where: { IdUserLogin: Number(id) }
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error retrieving user:", error);
            throw new Error("Failed to retrieve user");
        }
    }

    static async adminGetUserByUsername(username) {
        try {
            const user = await withTimeout(prisma.userLogin.findUnique({
                where: { UserName: username }
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error retrieving user by username:", error);
            throw new Error("Failed to retrieve user");
        }
    }

    static async adminCreateUser(data, createdBy = 'SYSTEM') {
        try {
            // Hash password before storing
            const hashedPassword = await bcrypt.hash(data.Password, 10);

            const user = await withTimeout(prisma.userLogin.create({
                data: {
                    UserName: data.UserName,
                    Password: hashedPassword,
                    Status: data.Status || 'A',
                    CreatedBy: createdBy
                }
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error creating user:", error);
            throw new Error("Failed to create user");
        }
    }

    static async adminUpdateUser(id, data, modifiedBy = 'SYSTEM') {
        try {
            const updateData = {
                UserName: data.UserName,
                ModifiedBy: modifiedBy,
                DateModified: new Date()
            };

            // Only update password if provided
            if (data.Password && data.Password.trim() !== '') {
                updateData.Password = await bcrypt.hash(data.Password, 10);
            }

            if (data.Status) {
                updateData.Status = data.Status;
            }

            const user = await withTimeout(prisma.userLogin.update({
                where: { IdUserLogin: Number(id) },
                data: updateData
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error updating user:", error);
            throw new Error("Failed to update user");
        }
    }

    static async adminDeleteUser(id) {
        try {
            // Soft delete - just set Status to N
            const user = await withTimeout(prisma.userLogin.update({
                where: { IdUserLogin: Number(id) },
                data: {
                    Status: 'N'
                }
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error deleting user:", error);
            throw new Error("Failed to delete user");
        }
    }

    static async authenticateUser(username, password) {
        try {
            const user = await withTimeout(prisma.userLogin.findUnique({
                where: { UserName: username }
            }));

            if (!user || user.Status !== 'A') {
                return null;
            }

            const isValidPassword = await bcrypt.compare(password, user.Password);
            if (!isValidPassword) {
                return null;
            }

            // Return user without password
            const { Password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error("🔥 Prisma error authenticating user:", error);
            throw new Error("Failed to authenticate user");
        }
    }

    static async changePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            const user = await withTimeout(prisma.userLogin.update({
                where: { IdUserLogin: Number(id) },
                data: {
                    Password: hashedPassword,
                    DateModified: new Date()
                }
            }));
            return user;
        } catch (error) {
            console.error("🔥 Prisma error changing password:", error);
            throw new Error("Failed to change password");
        }
    }
}
